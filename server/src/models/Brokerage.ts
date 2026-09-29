import mongoose, { type InferSchemaType } from 'mongoose'

const brokerageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    leadWebhookSecretHash: { type: String, select: false },
  },
  { timestamps: true },
)

brokerageSchema.index(
  { leadWebhookSecretHash: 1 },
  { unique: true, partialFilterExpression: { leadWebhookSecretHash: { $type: 'string' } } },
)

export type BrokerageDocument = InferSchemaType<typeof brokerageSchema> & mongoose.Document

export const Brokerage = mongoose.models.Brokerage
  ?? mongoose.model('Brokerage', brokerageSchema)