import mongoose, { type InferSchemaType } from 'mongoose'

export const DOCUMENT_TYPES = ['IDENTITY', 'INCOME', 'BANK_STATEMENT', 'OTHER'] as const
export const VERIFICATION_STATUSES = ['UPLOADED', 'CHECKING', 'VERIFIED', 'FAILED'] as const

const documentSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCase', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: { type: String, required: true, maxlength: 255 },
    storageKey: { type: String, required: true, unique: true, select: false },
    mimeType: { type: String, required: true, enum: ['application/pdf', 'image/jpeg', 'image/png'] },
    size: { type: Number, required: true, min: 1, max: 10 * 1024 * 1024 },
    documentType: { type: String, required: true, enum: DOCUMENT_TYPES },
    verificationStatus: { type: String, required: true, enum: VERIFICATION_STATUSES, default: 'UPLOADED' },
    verificationAttempts: { type: Number, required: true, default: 0 },
    verificationError: { type: String, maxlength: 500 },
  },
  { timestamps: true },
)

documentSchema.index({ brokerageId: 1, caseId: 1, createdAt: -1 })
documentSchema.index({ brokerageId: 1, clientId: 1, createdAt: -1 })

export type DocumentDocument = InferSchemaType<typeof documentSchema> & mongoose.Document

export const DocumentModel = mongoose.models.Document ?? mongoose.model('Document', documentSchema)