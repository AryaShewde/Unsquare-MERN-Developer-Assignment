import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import { Types } from 'mongoose'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { ClientCase } from '../models/ClientCase.js'
import { DocumentModel, type DocumentDocument } from '../models/Document.js'
import type { VerificationStatus } from '../models/verificationStatus.js'
import { VerificationJob } from '../models/VerificationJob.js'
import { ROLES } from '../models/roles.js'
import { AppError } from '../utils/AppError.js'
import { createPrivateDownloadUrl, deletePrivateObject, putPrivateObject } from './objectStorage.js'
import { publishDocumentStatus } from './documentRealtime.js'

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const maxFileSize = 10 * 1024 * 1024

export interface DocumentSummary {
  id: string
  brokerageId: string
  clientId: string
  caseId: string
  uploadedBy: string
  originalFileName: string
  mimeType: string
  size: number
  documentType: string
  verificationStatus: VerificationStatus
  verificationAttempts: number
  verificationError: string | null
  createdAt: string
  updatedAt: string
}

export interface UploadedDocumentFile {
  originalname: string
  size: number
  buffer: Buffer
}

export function serializeDocument(document: DocumentDocument): DocumentSummary {
  return {
    id: document.id,
    brokerageId: document.brokerageId.toString(),
    clientId: document.clientId.toString(),
    caseId: document.caseId.toString(),
    uploadedBy: document.uploadedBy.toString(),
    originalFileName: document.originalFileName,
    mimeType: document.mimeType,
    size: document.size,
    documentType: document.documentType,
    verificationStatus: document.verificationStatus,
    verificationAttempts: document.verificationAttempts,
    verificationError: document.verificationError ?? null,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

function assertDocumentAccess(user: AuthenticatedUser, document: DocumentDocument): void {
  if (user.role === ROLES.CLIENT) {
    if (document.clientId.toString() !== user.id || document.brokerageId.toString() !== user.brokerageId) {
      throw new AppError(404, 'Document not found.')
    }
    return
  }
  if (user.role !== ROLES.PLATFORM_ADMIN && document.brokerageId.toString() !== user.brokerageId) {
    throw new AppError(404, 'Document not found.')
  }
}

async function loadDocument(user: AuthenticatedUser, documentId: string): Promise<DocumentDocument> {
  if (!Types.ObjectId.isValid(documentId)) throw new AppError(404, 'Document not found.')
  const filter: Record<string, unknown> = { _id: documentId }
  if (user.role === ROLES.CLIENT) {
    filter.clientId = user.id
    filter.brokerageId = user.brokerageId
  } else if (user.role !== ROLES.PLATFORM_ADMIN) {
    filter.brokerageId = user.brokerageId
  }
  const document = await DocumentModel.findOne(filter)
  if (!document) throw new AppError(404, 'Document not found.')
  assertDocumentAccess(user, document)
  return document
}

export async function listCaseDocuments(user: AuthenticatedUser, caseId: string): Promise<DocumentSummary[]> {
  if (!Types.ObjectId.isValid(caseId)) throw new AppError(404, 'Case not found.')
  const clientCase = await ClientCase.findById(caseId).select('brokerageId clientUserId')
  if (!clientCase) throw new AppError(404, 'Case not found.')
  if (user.role === ROLES.CLIENT) {
    if (clientCase.clientUserId.toString() !== user.id || clientCase.brokerageId.toString() !== user.brokerageId) {
      throw new AppError(404, 'Case not found.')
    }
  } else if (user.role !== ROLES.PLATFORM_ADMIN && clientCase.brokerageId.toString() !== user.brokerageId) {
    throw new AppError(404, 'Case not found.')
  }
  const documents = await DocumentModel.find({ brokerageId: clientCase.brokerageId, caseId }).sort({ createdAt: -1 })
  return documents.map(serializeDocument)
}

export async function listMyDocuments(user: AuthenticatedUser): Promise<DocumentSummary[]> {
  if (user.role !== ROLES.CLIENT || !user.brokerageId) throw new AppError(403, 'Client access required.')
  const documents = await DocumentModel.find({ brokerageId: user.brokerageId, clientId: user.id }).sort({ createdAt: -1 })
  return documents.map(serializeDocument)
}

export async function uploadClientDocument(
  user: AuthenticatedUser,
  file: UploadedDocumentFile | undefined,
  documentType: string,
) {
  if (user.role !== ROLES.CLIENT || !user.brokerageId) throw new AppError(403, 'Client access required.')
  if (!file) throw new AppError(400, 'A document file is required.')
  if (file.size > maxFileSize) throw new AppError(413, 'Documents must be 10 MB or smaller.')
  if (!['IDENTITY', 'INCOME', 'BANK_STATEMENT', 'OTHER'].includes(documentType)) {
    throw new AppError(400, 'Invalid document type.')
  }

  const detectedType = await fileTypeFromBuffer(file.buffer)
  if (!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
    throw new AppError(415, 'Only valid PDF, JPEG, and PNG documents are allowed.')
  }

  const clientCase = await ClientCase.findOne({ clientUserId: user.id, brokerageId: user.brokerageId })
  if (!clientCase) throw new AppError(404, 'Client case not found.')

  const originalFileName = path.basename(file.originalname.replace(/[\\/]/g, '_')).replace(/[\u0000-\u001f\u007f]/g, '_').slice(0, 255)
  const storageKey = `${user.brokerageId}/${user.id}/${randomUUID()}`
  await putPrivateObject(storageKey, file.buffer, detectedType.mime)

  let document: DocumentDocument | null = null
  try {
    const createdDocument = await DocumentModel.create({
      brokerageId: user.brokerageId,
      clientId: user.id,
      caseId: clientCase._id,
      uploadedBy: user.id,
      originalFileName: originalFileName || 'document',
      storageKey,
      mimeType: detectedType.mime,
      size: file.size,
      documentType,
      verificationStatus: 'UPLOADED',
      verificationAttempts: 0,
    })
    document = createdDocument
    await VerificationJob.create({
      documentId: createdDocument._id,
      brokerageId: user.brokerageId,
      clientId: user.id,
      state: 'PENDING',
      runAt: new Date(),
    })
  } catch (error) {
    if (document) {
      await VerificationJob.deleteOne({ documentId: document._id })
      await DocumentModel.deleteOne({ _id: document._id })
    }
    await deletePrivateObject(storageKey)
    if ((error as { code?: number }).code === 11000) throw new AppError(409, 'This document upload was already recorded.')
    throw error
  }

  if (!document) throw new AppError(500, 'Document upload could not be recorded.')
  const summary = serializeDocument(document)
  publishDocumentStatus({
    action: 'status',
    brokerageId: summary.brokerageId,
    clientId: summary.clientId,
    caseId: summary.caseId,
    document: {
      id: summary.id,
      originalFileName: summary.originalFileName,
      documentType: summary.documentType,
      verificationStatus: summary.verificationStatus,
      verificationAttempts: summary.verificationAttempts,
      verificationError: summary.verificationError,
      updatedAt: summary.updatedAt,
    },
  })
  return summary
}

export async function getDocumentDownload(user: AuthenticatedUser, documentId: string) {
  const document = await loadDocument(user, documentId)
  const storageKey = await DocumentModel.findOne({
    _id: document._id,
    brokerageId: document.brokerageId,
    clientId: document.clientId,
  }).select('+storageKey')
  if (!storageKey) throw new AppError(404, 'Document not found.')
  const url = await createPrivateDownloadUrl(storageKey.storageKey, document.originalFileName)
  return { url, expiresInSeconds: 120 }
}

export async function markDocumentStatus(
  document: DocumentDocument,
  verificationStatus: VerificationStatus,
  verificationError: string | null,
  incrementAttempt = false,
) {
  const updated = await DocumentModel.findOneAndUpdate(
    { _id: document._id, brokerageId: document.brokerageId, clientId: document.clientId },
    {
      $set: { verificationStatus, verificationError },
      ...(incrementAttempt ? { $inc: { verificationAttempts: 1 } } : {}),
    },
    { new: true },
  )
  if (!updated) throw new AppError(404, 'Document not found.')
  const summary = serializeDocument(updated)
  publishDocumentStatus({
    action: 'status',
    brokerageId: summary.brokerageId,
    clientId: summary.clientId,
    caseId: summary.caseId,
    document: {
      id: summary.id,
      originalFileName: summary.originalFileName,
      documentType: summary.documentType,
      verificationStatus: summary.verificationStatus,
      verificationAttempts: summary.verificationAttempts,
      verificationError: summary.verificationError,
      updatedAt: summary.updatedAt,
    },
  })
  return updated
}

export async function retryDocumentVerification(user: AuthenticatedUser, documentId: string) {
  const document = await loadDocument(user, documentId)
  if (document.verificationStatus !== 'FAILED') throw new AppError(409, 'Only failed documents can be retried.')

  const updated = await DocumentModel.findOneAndUpdate(
    { _id: document._id, brokerageId: document.brokerageId, clientId: document.clientId, verificationStatus: 'FAILED' },
    { $set: { verificationStatus: 'UPLOADED', verificationError: null } },
    { new: true },
  )
  if (!updated) throw new AppError(409, 'Document status changed. Refresh and retry.')

  const job = await VerificationJob.findOneAndUpdate(
    { documentId: updated._id, brokerageId: updated.brokerageId, clientId: updated.clientId },
    { $set: { state: 'PENDING', attempts: 0, runAt: new Date(), leaseUntil: null, lastError: null } },
    { new: true },
  )
  if (!job) {
    await markDocumentStatus(updated, 'FAILED', 'Verification job could not be restarted.')
    throw new AppError(503, 'Verification retry could not be queued.')
  }
  const summary = serializeDocument(updated)
  publishDocumentStatus({
    action: 'status',
    brokerageId: summary.brokerageId,
    clientId: summary.clientId,
    caseId: summary.caseId,
    document: {
      id: summary.id,
      originalFileName: summary.originalFileName,
      documentType: summary.documentType,
      verificationStatus: summary.verificationStatus,
      verificationAttempts: summary.verificationAttempts,
      verificationError: summary.verificationError,
      updatedAt: summary.updatedAt,
    },
  })
  return summary
}

export async function getDocumentById(user: AuthenticatedUser, documentId: string): Promise<DocumentSummary> {
  return serializeDocument(await loadDocument(user, documentId))
}