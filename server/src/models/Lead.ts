import mongoose, { type InferSchemaType } from 'mongoose'
import { LEAD_STATUSES } from './leadStatus.js'

const leadSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    emailNormalized: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },
    phoneNormalized: { type: String, required: true, select: false },
    source: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: LEAD_STATUSES, default: 'NEW', required: true },
    assignedAdvisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, trim: true, maxlength: 5000 },
    sourceEventId: { type: String, trim: true, select: false },
    convertedCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCase', default: null },
    convertedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

leadSchema.index(
  { brokerageId: 1, emailNormalized: 1 },
  { unique: true, partialFilterExpression: { emailNormalized: { $type: 'string' } } },
)
leadSchema.index(
  { brokerageId: 1, phoneNormalized: 1 },
  { unique: true, partialFilterExpression: { phoneNormalized: { $type: 'string' } } },
)
leadSchema.index(
  { brokerageId: 1, sourceEventId: 1 },
  { unique: true, partialFilterExpression: { sourceEventId: { $type: 'string' } } },
)

export type LeadDocument = InferSchemaType<typeof leadSchema> & mongoose.Document

export const Lead = mongoose.models.Lead ?? mongoose.model('Lead', leadSchema)