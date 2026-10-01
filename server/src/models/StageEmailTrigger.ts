import mongoose, { type InferSchemaType } from 'mongoose'
import { LEAD_STATUSES } from './leadStatus.js'

const stageEmailTriggerSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    stage: { type: String, enum: LEAD_STATUSES, required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

stageEmailTriggerSchema.index({ brokerageId: 1, stage: 1 })

export type StageEmailTriggerDocument = InferSchemaType<typeof stageEmailTriggerSchema> & mongoose.Document

export const StageEmailTrigger = mongoose.models.StageEmailTrigger ?? mongoose.model('StageEmailTrigger', stageEmailTriggerSchema)