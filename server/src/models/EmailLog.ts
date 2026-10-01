import mongoose, { type InferSchemaType } from 'mongoose'
import { LEAD_STATUSES } from './leadStatus.js'

const EMAIL_LOG_STATUSES = ['QUEUED', 'SENT', 'FAILED'] as const
export type EmailLogStatus = (typeof EMAIL_LOG_STATUSES)[number]

const emailLogSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCase', default: null },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', default: null },
    recipientEmail: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    status: { type: String, enum: EMAIL_LOG_STATUSES, required: true },
    providerMessageId: { type: String, default: null },
    errorMessage: { type: String, default: null },
    triggerStage: { type: String, enum: LEAD_STATUSES, default: null },
    idempotencyKey: { type: String, required: true, index: true },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
)

emailLogSchema.index({ brokerageId: 1, idempotencyKey: 1 }, { unique: true })

export type EmailLogDocument = InferSchemaType<typeof emailLogSchema> & mongoose.Document

export const EmailLog = mongoose.models.EmailLog ?? mongoose.model('EmailLog', emailLogSchema)