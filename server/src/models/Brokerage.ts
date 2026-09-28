import mongoose, { type InferSchemaType } from 'mongoose'

const brokerageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true },
)

export type BrokerageDocument = InferSchemaType<typeof brokerageSchema> & mongoose.Document

export const Brokerage = mongoose.models.Brokerage
  ?? mongoose.model('Brokerage', brokerageSchema)