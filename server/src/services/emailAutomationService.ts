import { Types } from 'mongoose'
import { EmailTemplate } from '../models/EmailTemplate.js'
import { EmailLog, type EmailLogStatus } from '../models/EmailLog.js'
import { StageEmailTrigger } from '../models/StageEmailTrigger.js'
import { Lead, type LeadDocument } from '../models/Lead.js'
import { ClientCase } from '../models/ClientCase.js'
import { User } from '../models/User.js'
import { sendEmail, renderTemplate } from './emailService.js'
import type { LeadStatus } from '../models/leadStatus.js'
import { AppError } from '../utils/AppError.js'

function generateIdempotencyKey(
  brokerageId: string,
  leadId: string,
  oldStatus: LeadStatus,
  newStatus: LeadStatus,
): string {
  return `email:${brokerageId}:${leadId}:${oldStatus}:${newStatus}`
}

export interface AutomationContext {
  lead: LeadDocument
  oldStatus: LeadStatus
  newStatus: LeadStatus
}

async function resolveRecipientEmail(lead: LeadDocument): Promise<string | null> {
  // If converted to client, use client's email
  if (lead.convertedCaseId) {
    const clientCase = await ClientCase.findById(lead.convertedCaseId).select('email')
    if (clientCase?.email) {
      return clientCase.email.toLowerCase()
    }
  }
  // Otherwise use lead's email
  return lead.email?.toLowerCase() ?? null
}

async function resolveTemplateVariables(lead: LeadDocument) {
  const variables: Record<string, string | null> = {
    leadName: `${lead.firstName} ${lead.lastName}`,
    clientName: `${lead.firstName} ${lead.lastName}`,
    advisorName: null,
  }

  if (lead.assignedAdvisorId) {
    const advisor = await User.findById(lead.assignedAdvisorId).select('name')
    if (advisor) {
      variables.advisorName = advisor.name
    }
  }

  // If converted, try to get client name
  if (lead.convertedCaseId) {
    const clientCase = await ClientCase.findById(lead.convertedCaseId).select('firstName lastName')
    if (clientCase) {
      variables.clientName = `${clientCase.firstName} ${clientCase.lastName}`
    }
  }

  return variables
}

export async function processStageEmailAutomation(context: AutomationContext): Promise<void> {
  const { lead, oldStatus, newStatus } = context

  // Only trigger on actual status change
  if (oldStatus === newStatus) {
    return
  }

  const brokerageId = lead.brokerageId.toString()

  // Find active trigger for the new stage
  const trigger = await StageEmailTrigger.findOne({
    brokerageId: lead.brokerageId,
    stage: newStatus,
    active: true,
  }).populate('templateId')

  if (!trigger) {
    return // No automation configured for this stage
  }

  const template = trigger.templateId as unknown as { _id: Types.ObjectId; subject: string; body: string }
  const templateId = template._id.toString()

  // Check idempotency - only process once per stage transition
  const idempotencyKey = generateIdempotencyKey(brokerageId, lead.id, oldStatus, newStatus)

  // Check if already processed
  const existingLog = await EmailLog.findOne({ brokerageId: lead.brokerageId, idempotencyKey })
  if (existingLog) {
    return // Already processed this transition
  }

  // Resolve recipient
  const recipientEmail = await resolveRecipientEmail(lead)
  if (!recipientEmail) {
    await EmailLog.create({
      brokerageId: lead.brokerageId,
      leadId: lead._id,
      templateId: template._id,
      recipientEmail: '',
      subject: template.subject,
      status: 'FAILED',
      errorMessage: 'No valid recipient email found',
      triggerStage: newStatus,
      idempotencyKey,
      sentAt: new Date(),
    })
    return
  }

  // Render template
  const variables = await resolveTemplateVariables(lead)
  const renderedSubject = renderTemplate(template.subject, variables)
  const renderedBody = renderTemplate(template.body, variables)

  // Create log entry first (for idempotency)
  const emailLog = await EmailLog.create({
    brokerageId: lead.brokerageId,
    leadId: lead._id,
    clientId: lead.convertedCaseId,
    templateId: template._id,
    recipientEmail,
    subject: renderedSubject,
    status: 'QUEUED',
    triggerStage: newStatus,
    idempotencyKey,
  })

  // Send email
  const result = await sendEmail({
    to: recipientEmail,
    subject: renderedSubject,
    html: renderedBody,
  })

  // Update log with result
  const update: { status: EmailLogStatus; providerMessageId?: string; errorMessage?: string; sentAt: Date } = {
    status: result.success ? 'SENT' : 'FAILED',
    sentAt: new Date(),
  }

  if (result.success && result.messageId) {
    update.providerMessageId = result.messageId
  } else if (result.error) {
    update.errorMessage = result.error
  }

  await EmailLog.findByIdAndUpdate(emailLog._id, { $set: update })
}

export async function listEmailLogs(
  brokerageId: string,
  leadId?: string,
  status?: EmailLogStatus,
  limit = 100,
) {
  const filter: Record<string, unknown> = { brokerageId: new Types.ObjectId(brokerageId) }
  if (leadId) filter.leadId = new Types.ObjectId(leadId)
  if (status) filter.status = status

  const logs = await EmailLog.find(filter)
    .populate('leadId', 'firstName lastName')
    .populate('templateId', 'name subject')
    .sort({ createdAt: -1 })
    .limit(limit)

  return logs.map((log) => {
    const obj = log.toObject() as Record<string, unknown>
    return {
      id: obj._id,
      leadId: obj.leadId,
      clientId: obj.clientId,
      templateId: obj.templateId,
      recipientEmail: obj.recipientEmail,
      subject: obj.subject,
      status: obj.status,
      providerMessageId: obj.providerMessageId,
      errorMessage: obj.errorMessage,
      triggerStage: obj.triggerStage,
      sentAt: obj.sentAt,
      createdAt: obj.createdAt,
    }
  })
}