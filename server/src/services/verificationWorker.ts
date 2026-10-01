import mongoose from 'mongoose'
import { DocumentModel } from '../models/Document.js'
import { VerificationJob } from '../models/VerificationJob.js'
import { markDocumentStatus } from './documentService.js'

const defaultDelayMs = 5000
const maxDelayMs = 60_000
const pollIntervalMs = 250
const maxJobAttempts = 3

function getDelayMs(): number {
  const configured = Number(process.env.DOCUMENT_VERIFICATION_DELAY_MS ?? defaultDelayMs)
  return Number.isFinite(configured) ? Math.max(0, Math.min(configured, maxDelayMs)) : defaultDelayMs
}

function getFailurePercent(): number {
  const configured = Number(process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT ?? 30)
  return Number.isFinite(configured) ? Math.max(0, Math.min(configured, 100)) : 30
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function claimNextJob() {
  if (mongoose.connection.readyState !== 1) return null
  const now = new Date()
  const leaseUntil = new Date(now.getTime() + Math.max(120_000, getDelayMs() + 60_000))
  return VerificationJob.findOneAndUpdate(
    {
      $or: [
        { state: 'PENDING', runAt: { $lte: now } },
        { state: 'PROCESSING', leaseUntil: { $lte: now } },
      ],
    },
    { $set: { state: 'PROCESSING', leaseUntil }, $inc: { attempts: 1 } },
    { new: true, sort: { runAt: 1, createdAt: 1 } },
  )
}

export async function processNextVerificationJob(): Promise<boolean> {
  const job = await claimNextJob()
  if (!job) return false

  const document = await DocumentModel.findOne({
    _id: job.documentId,
    brokerageId: job.brokerageId,
    clientId: job.clientId,
  })

  if (!document) {
    await VerificationJob.updateOne({ _id: job._id }, { $set: { state: 'DEAD', leaseUntil: null, lastError: 'Document record is missing.' } })
    return true
  }

  if (document.verificationStatus === 'VERIFIED' || document.verificationStatus === 'FAILED') {
    await VerificationJob.updateOne({ _id: job._id, state: 'PROCESSING' }, {
      $set: { state: 'COMPLETED', leaseUntil: null, lastError: null },
    })
    return true
  }

  if (job.attempts > maxJobAttempts) {
    await markDocumentStatus(document, 'FAILED', 'Verification worker could not complete this check. Retry the document to try again.')
    await VerificationJob.updateOne({ _id: job._id }, { $set: { state: 'DEAD', leaseUntil: null, lastError: 'Maximum worker attempts exceeded.' } })
    return true
  }

  try {
    const checking = await markDocumentStatus(document, 'CHECKING', null, true)
    await delay(getDelayMs())
    const failed = Math.random() * 100 < getFailurePercent()
    const result = await markDocumentStatus(
      checking,
      failed ? 'FAILED' : 'VERIFIED',
      failed ? 'The simulated document check could not verify this file. Retry or upload a clearer copy.' : null,
    )
    await VerificationJob.updateOne({ _id: job._id, state: 'PROCESSING' }, {
      $set: { state: 'COMPLETED', leaseUntil: null, lastError: null },
    })
    return Boolean(result)
  } catch {
    const retryable = job.attempts < maxJobAttempts
    if (retryable) {
      await markDocumentStatus(document, 'UPLOADED', 'Verification was interrupted and will be retried automatically.')
      await VerificationJob.updateOne({ _id: job._id, state: 'PROCESSING' }, {
        $set: {
          state: 'PENDING',
          leaseUntil: null,
          runAt: new Date(Date.now() + Math.min(30_000, 1000 * 2 ** job.attempts)),
          lastError: 'Verification worker attempt failed.',
        },
      })
      return true
    }
    await markDocumentStatus(document, 'FAILED', 'Verification worker could not complete this check. Retry the document to try again.')
    await VerificationJob.updateOne({ _id: job._id, state: 'PROCESSING' }, {
      $set: { state: 'DEAD', leaseUntil: null, lastError: 'Maximum worker attempts exceeded.' },
    })
    return true
  }
}

export function startVerificationWorker(): () => void {
  let stopped = false
  let active = false
  const interval = setInterval(() => {
    if (stopped || active) return
    active = true
    void processNextVerificationJob()
      .catch((error: unknown) => {
        console.error('Document verification worker poll failed:', error instanceof Error ? error.message : 'unknown error')
      })
      .finally(() => { active = false })
  }, pollIntervalMs)

  return () => {
    stopped = true
    clearInterval(interval)
  }
}