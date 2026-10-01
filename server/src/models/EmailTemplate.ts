import mongoose, { type InferSchemaType } from 'mongoose'

const emailTemplateSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 10000 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

emailTemplateSchema.index({ brokerageId: 1, name: 1 }, { unique: true })

export type EmailTemplateDocument = InferSchemaType<typeof emailTemplateSchema> & mongoose.Document

export const EmailTemplate = mongoose.models.EmailTemplate ?? mongoose.model('EmailTemplate', emailTemplateSchema)