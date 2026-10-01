import mongoose, { type InferSchemaType } from 'mongoose'
import { LEAD_STATUSES } from './leadStatus.js'

const taskTriggerSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    stage: { type: String, enum: LEAD_STATUSES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    dueDays: { type: Number, required: true, min: 1, max: 365 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

taskTriggerSchema.index({ brokerageId: 1, stage: 1 })

export type TaskTriggerDocument = InferSchemaType<typeof taskTriggerSchema> & mongoose.Document

export const TaskTrigger = mongoose.models.TaskTrigger ?? mongoose.model('TaskTrigger', taskTriggerSchema)