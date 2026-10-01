import mongoose, { type InferSchemaType } from 'mongoose'

const TASK_STATUSES = ['OPEN', 'COMPLETED'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

const TASK_SOURCES = ['MANUAL', 'STAGE_TRIGGER'] as const
export type TaskSource = (typeof TASK_SOURCES)[number]

const taskSchema = new mongoose.Schema(
  {
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCase', default: null },
    assignedAdvisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: TASK_STATUSES, default: 'OPEN', required: true },
    source: { type: String, enum: TASK_SOURCES, default: 'MANUAL', required: true },
    triggerStage: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

taskSchema.index({ brokerageId: 1, assignedAdvisorId: 1, status: 1 })
taskSchema.index({ brokerageId: 1, leadId: 1 })

export type TaskDocument = InferSchemaType<typeof taskSchema> & mongoose.Document

export const Task = mongoose.models.Task ?? mongoose.model('Task', taskSchema)