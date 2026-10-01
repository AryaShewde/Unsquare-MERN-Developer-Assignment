import { Types } from 'mongoose'
import { Task } from '../models/Task.js'
import { TaskTrigger } from '../models/TaskTrigger.js'
import type { LeadStatus } from '../models/leadStatus.js'
import type { LeadDocument } from '../models/Lead.js'
import { AppError } from '../utils/AppError.js'
import { publishTaskEvent, serializeTaskForRealtime } from './taskRealtime.js'

function generateTaskIdempotencyKey(
  brokerageId: string,
  leadId: string,
  triggerId: string,
): string {
  return `task:${brokerageId}:${leadId}:${triggerId}`
}

export interface TaskAutomationContext {
  lead: LeadDocument
  oldStatus: LeadStatus
  newStatus: LeadStatus
}

export async function processStageTaskAutomation(context: TaskAutomationContext): Promise<void> {
  const { lead, oldStatus, newStatus } = context

  // Only trigger on actual status change
  if (oldStatus === newStatus) {
    return
  }

  const brokerageId = lead.brokerageId.toString()

  // Find active triggers for the new stage
  const triggers = await TaskTrigger.find({
    brokerageId: lead.brokerageId,
    stage: newStatus,
    active: true,
  })

  if (triggers.length === 0) {
    return // No automation configured for this stage
  }

  // Check if lead has an assigned advisor
  if (!lead.assignedAdvisorId) {
    // Log but don't fail - no advisor to assign task to
    return
  }

  // Process each trigger
  for (const trigger of triggers) {
    const idempotencyKey = generateTaskIdempotencyKey(brokerageId, lead.id, trigger.id)

    // Check idempotency - only create once per trigger per lead
    const existingTask = await Task.findOne({ brokerageId: lead.brokerageId, leadId: lead._id, triggerStage: newStatus })
    if (existingTask) {
      return // Already created a task for this stage transition
    }

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + trigger.dueDays)

    // Create the task
    const task = await Task.create({
      brokerageId: lead.brokerageId,
      leadId: lead._id,
      clientId: lead.convertedCaseId,
      assignedAdvisorId: lead.assignedAdvisorId,
      title: trigger.title,
      description: trigger.description ?? null,
      dueDate,
      status: 'OPEN',
      source: 'STAGE_TRIGGER',
      triggerStage: newStatus,
    })

    const populated = await task.populate('leadId', 'firstName lastName')
    const serialized = serializeTaskForRealtime(populated as unknown as Parameters<typeof serializeTaskForRealtime>[0])

    publishTaskEvent('created', brokerageId, serialized.id, serialized)
  }
}

// Task trigger configuration service
export async function listTaskTriggers(brokerageId: string) {
  const triggers = await TaskTrigger.find({ brokerageId: new Types.ObjectId(brokerageId) })
    .sort({ stage: 1 })

  return triggers.map((trigger) => {
    const obj = trigger.toObject() as Record<string, unknown>
    return {
      id: obj._id,
      brokerageId: obj.brokerageId,
      stage: obj.stage,
      title: obj.title,
      description: obj.description,
      dueDays: obj.dueDays,
      active: obj.active,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }
  })
}

export async function getTaskTrigger(brokerageId: string, triggerId: string) {
  if (!Types.ObjectId.isValid(triggerId)) {
    throw new AppError(404, 'Task trigger not found.')
  }

  const trigger = await TaskTrigger.findOne({
    _id: triggerId,
    brokerageId: new Types.ObjectId(brokerageId),
  })

  if (!trigger) {
    throw new AppError(404, 'Task trigger not found.')
  }

  return trigger
}

export async function createTaskTrigger(
  brokerageId: string,
  input: {
    stage: string
    title: string
    description?: string
    dueDays: number
    active?: boolean
  },
) {
  const trigger = await TaskTrigger.create({
    brokerageId: new Types.ObjectId(brokerageId),
    stage: input.stage,
    title: input.title,
    description: input.description ?? null,
    dueDays: input.dueDays,
    active: input.active ?? true,
  })

  const obj = trigger.toObject() as Record<string, unknown>
  return {
    id: String(obj._id),
    brokerageId: String(obj.brokerageId),
    stage: obj.stage,
    title: obj.title,
    description: obj.description,
    dueDays: obj.dueDays,
    active: obj.active,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  }
}

export async function updateTaskTrigger(
  brokerageId: string,
  triggerId: string,
  patch: {
    stage?: string
    title?: string
    description?: string
    dueDays?: number
    active?: boolean
  },
) {
  const existing = await getTaskTrigger(brokerageId, triggerId)

  const update: Record<string, unknown> = {}
  if (patch.stage !== undefined) update.stage = patch.stage
  if (patch.title !== undefined) update.title = patch.title
  if (patch.description !== undefined) update.description = patch.description ?? null
  if (patch.dueDays !== undefined) update.dueDays = patch.dueDays
  if (patch.active !== undefined) update.active = patch.active

  const updated = await TaskTrigger.findOneAndUpdate(
    { _id: triggerId },
    { $set: update },
    { new: true, runValidators: true },
  )

  if (!updated) {
    throw new AppError(404, 'Task trigger not found.')
  }

  return updated
}

export async function deleteTaskTrigger(brokerageId: string, triggerId: string) {
  await getTaskTrigger(brokerageId, triggerId)
  await TaskTrigger.deleteOne({ _id: triggerId })
}

// Email trigger configuration service
export async function listEmailTriggers(brokerageId: string) {
  const triggers = await StageEmailTrigger.find({ brokerageId: new Types.ObjectId(brokerageId) })
    .populate('templateId', 'name subject active')
    .sort({ stage: 1 })

  return triggers.map((trigger) => {
    const obj = trigger.toObject() as Record<string, unknown>
    const template = obj.templateId as Record<string, unknown> | undefined
    return {
      id: obj._id,
      brokerageId: obj.brokerageId,
      stage: obj.stage,
      templateId: obj.templateId,
      templateName: template?.name,
      templateSubject: template?.subject,
      templateActive: template?.active,
      active: obj.active,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }
  })
}

export async function getEmailTrigger(brokerageId: string, triggerId: string) {
  if (!Types.ObjectId.isValid(triggerId)) {
    throw new AppError(404, 'Email trigger not found.')
  }

  const trigger = await StageEmailTrigger.findOne({
    _id: triggerId,
    brokerageId: new Types.ObjectId(brokerageId),
  }).populate('templateId')

  if (!trigger) {
    throw new AppError(404, 'Email trigger not found.')
  }

  return trigger
}

export async function createEmailTrigger(
  brokerageId: string,
  input: {
    stage: string
    templateId: string
    active?: boolean
  },
) {
  // Verify template belongs to same brokerage
  const { EmailTemplate } = await import('../models/EmailTemplate.js')
  const template = await EmailTemplate.findOne({
    _id: new Types.ObjectId(input.templateId),
    brokerageId: new Types.ObjectId(brokerageId),
  })

  if (!template) {
    throw new AppError(400, 'The template must belong to this brokerage.')
  }

  const trigger = await StageEmailTrigger.create({
    brokerageId: new Types.ObjectId(brokerageId),
    stage: input.stage,
    templateId: template._id,
    active: input.active ?? true,
  })

  const populated = await trigger.populate('templateId')
  const obj = populated.toObject() as Record<string, unknown>
  const tmpl = obj.templateId as Record<string, unknown> | undefined
  return {
    id: String(obj._id),
    brokerageId: String(obj.brokerageId),
    stage: obj.stage,
    templateId: tmpl?._id ? String(tmpl._id) : String(obj.templateId),
    templateName: tmpl?.name,
    templateSubject: tmpl?.subject,
    templateActive: tmpl?.active,
    active: obj.active,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  }
}

export async function updateEmailTrigger(
  brokerageId: string,
  triggerId: string,
  patch: {
    stage?: string
    templateId?: string
    active?: boolean
  },
) {
  const existing = await getEmailTrigger(brokerageId, triggerId)

  const update: Record<string, unknown> = {}
  if (patch.stage !== undefined) update.stage = patch.stage
  if (patch.active !== undefined) update.active = patch.active

  if (patch.templateId !== undefined) {
    const { EmailTemplate } = await import('../models/EmailTemplate.js')
    const template = await EmailTemplate.findOne({
      _id: new Types.ObjectId(patch.templateId),
      brokerageId: new Types.ObjectId(brokerageId),
    })
    if (!template) {
      throw new AppError(400, 'The template must belong to this brokerage.')
    }
    update.templateId = template._id
  }

  const updated = await StageEmailTrigger.findOneAndUpdate(
    { _id: triggerId },
    { $set: update },
    { new: true, runValidators: true },
  ).populate('templateId')

  if (!updated) {
    throw new AppError(404, 'Email trigger not found.')
  }

  return updated
}

export async function deleteEmailTrigger(brokerageId: string, triggerId: string) {
  await getEmailTrigger(brokerageId, triggerId)
  await StageEmailTrigger.deleteOne({ _id: triggerId })
}

// Import StageEmailTrigger for use in this service
import { StageEmailTrigger } from '../models/StageEmailTrigger.js'