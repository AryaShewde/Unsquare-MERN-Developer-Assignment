import mongoose, { type InferSchemaType } from 'mongoose'

const verificationJobSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, unique: true },
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: { type: String, required: true, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'DEAD'], default: 'PENDING', index: true },
    attempts: { type: Number, required: true, default: 0 },
    runAt: { type: Date, required: true, default: Date.now, index: true },
    leaseUntil: { type: Date, default: null, index: true },
    lastError: { type: String, maxlength: 500 },
  },
  { timestamps: true },
)

export type VerificationJobDocument = InferSchemaType<typeof verificationJobSchema> & mongoose.Document

export const VerificationJob = mongoose.models.VerificationJob
  ?? mongoose.model('VerificationJob', verificationJobSchema)