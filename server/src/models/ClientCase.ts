import mongoose, { type InferSchemaType } from 'mongoose'

const clientCaseSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
    clientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    applicationStatus: { type: String, enum: ['STARTED', 'IN_PROGRESS', 'COMPLETE'], default: 'STARTED', required: true },
  },
  { timestamps: true },
)

clientCaseSchema.index({ brokerageId: 1, clientUserId: 1 })

export type ClientCaseDocument = InferSchemaType<typeof clientCaseSchema> & mongoose.Document

export const ClientCase = mongoose.models.ClientCase ?? mongoose.model('ClientCase', clientCaseSchema)