import { Types, type FilterQuery } from 'mongoose'
import { Task, type TaskDocument, type TaskStatus, type TaskSource } from '../models/Task.js'
import { ROLES } from '../models/roles.js'
import { User } from '../models/User.js'
import { Lead } from '../models/Lead.js'
import { ClientCase } from '../models/ClientCase.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { AppError } from '../utils/AppError.js'
import { publishTaskEvent, serializeTaskForRealtime, type TaskEventData } from './taskRealtime.js'

export interface TaskInput {
  leadId?: string
  clientId?: string
  assignedAdvisorId: string
  title: string
  description?: string
  dueDate: string
  source?: TaskSource
  triggerStage?: string
  brokerageId?: string
}

export interface TaskPatch {
  title?: string
  description?: string
  dueDate?: string
  status?: TaskStatus
}

function serializeTask(task: TaskDocument): TaskEventData {
  return serializeTaskForRealtime(task as unknown as Parameters<typeof serializeTaskForRealtime>[0])
}

async function resolveTaskBrokerageFilter(
  user: AuthenticatedUser,
  requestedBrokerageId?: string,
): Promise<FilterQuery<TaskDocument>> {
  if (user.role === ROLES.PLATFORM_ADMIN) {
    if (requestedBrokerageId) {
      if (!Types.ObjectId.isValid(requestedBrokerageId)) {
        throw new AppError(400, 'Invalid brokerage ID.')
      }
      return { brokerageId: requestedBrokerageId }
    }
    return {}
  }
  if (!user.brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }
  if (requestedBrokerageId && requestedBrokerageId.toLowerCase() !== user.brokerageId.toLowerCase()) {
    throw new AppError(403, 'Cannot access another brokerage.')
  }
  return { brokerageId: user.brokerageId }
}

export async function listTasks(user: AuthenticatedUser, brokerageId?: string, advisorId?: string) {
  const filter = await resolveTaskBrokerageFilter(user, brokerageId)

  if (user.role === ROLES.ADVISOR) {
    filter.assignedAdvisorId = user.id
  } else if (advisorId) {
    filter.assignedAdvisorId = advisorId
  }

  if (user.role === ROLES.CLIENT) {
    throw new AppError(403, 'Clients cannot access tasks.')
  }

  const tasks = await Task.find(filter)
    .populate('leadId', 'firstName lastName')
    .populate('assignedAdvisorId', 'name')
    .sort({ dueDate: 1 })

  return tasks.map((task) => {
    const obj = task.toObject() as Record<string, unknown>
    return {
      id: obj._id,
      brokerageId: obj.brokerageId,
      leadId: obj.leadId,
      clientId: obj.clientId,
      assignedAdvisorId: obj.assignedAdvisorId,
      title: obj.title,
      description: obj.description,
      dueDate: obj.dueDate,
      status: obj.status,
      source: obj.source,
      triggerStage: obj.triggerStage,
      completedAt: obj.completedAt,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }
  })
}

export async function getTask(user: AuthenticatedUser, taskId: string) {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(404, 'Task not found.')
  }

  const filter: FilterQuery<TaskDocument> = { _id: taskId }
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    if (!user.brokerageId) {
      throw new AppError(403, 'A brokerage is required.')
    }
    filter.brokerageId = user.brokerageId
    if (user.role === ROLES.ADVISOR) {
      filter.assignedAdvisorId = user.id
    }
  }

  const task = await Task.findOne(filter)
    .populate('leadId', 'firstName lastName')
    .populate('clientId', 'firstName lastName')
    .populate('assignedAdvisorId', 'name')

  if (!task) {
    throw new AppError(404, 'Task not found.')
  }

  return task
}

export async function createTask(user: AuthenticatedUser, input: TaskInput) {
  if (user.role === ROLES.CLIENT) {
    throw new AppError(403, 'Clients cannot create tasks.')
  }

  const brokerageId = user.role === ROLES.PLATFORM_ADMIN
    ? input.brokerageId
    : user.brokerageId

  if (!brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }

  // Validate advisor belongs to the same brokerage
  if (!Types.ObjectId.isValid(input.assignedAdvisorId)) {
    throw new AppError(400, 'Invalid advisor ID.')
  }

  const advisor = await User.findOne({
    _id: input.assignedAdvisorId,
    role: ROLES.ADVISOR,
    brokerageId,
  }).select('_id')

  if (!advisor) {
    throw new AppError(400, 'The advisor must belong to this brokerage.')
  }

  // Validate lead if provided
  let leadId: Types.ObjectId | null = null
  if (input.leadId) {
    if (!Types.ObjectId.isValid(input.leadId)) {
      throw new AppError(400, 'Invalid lead ID.')
    }
    const lead = await Lead.findOne({ _id: input.leadId, brokerageId }).select('_id')
    if (!lead) {
      throw new AppError(400, 'The lead must belong to this brokerage.')
    }
    leadId = lead._id
  }

  // Validate client if provided
  let clientId: Types.ObjectId | null = null
  if (input.clientId) {
    if (!Types.ObjectId.isValid(input.clientId)) {
      throw new AppError(400, 'Invalid client ID.')
    }
    const client = await ClientCase.findOne({ _id: input.clientId, brokerageId }).select('_id')
    if (!client) {
      throw new AppError(400, 'The client must belong to this brokerage.')
    }
    clientId = client._id
  }

  const task = await Task.create({
    brokerageId: new Types.ObjectId(brokerageId),
    leadId,
    clientId,
    assignedAdvisorId: new Types.ObjectId(input.assignedAdvisorId),
    title: input.title,
    description: input.description ?? null,
    dueDate: new Date(input.dueDate),
    source: input.source ?? 'MANUAL',
    triggerStage: input.triggerStage ?? null,
  })

  const populated = await task.populate('leadId', 'firstName lastName')
  const serialized = serializeTask(populated as TaskDocument)

  publishTaskEvent('created', brokerageId, serialized.id, serialized)
  return serialized
}

export async function updateTask(user: AuthenticatedUser, taskId: string, patch: TaskPatch) {
  if (user.role === ROLES.CLIENT) {
    throw new AppError(403, 'Clients cannot modify tasks.')
  }

  const existing = await getTask(user, taskId)

  const update: Record<string, unknown> = {}
  if (patch.title !== undefined) update.title = patch.title
  if (patch.description !== undefined) update.description = patch.description ?? null
  if (patch.dueDate !== undefined) update.dueDate = new Date(patch.dueDate)
  if (patch.status !== undefined) {
    update.status = patch.status
    if (patch.status === 'COMPLETED') {
      update.completedAt = new Date()
    } else {
      update.completedAt = null
    }
  }

  const updated = await Task.findOneAndUpdate(
    { _id: taskId },
    { $set: update },
    { new: true },
  )
    .populate('leadId', 'firstName lastName')
    .populate('assignedAdvisorId', 'name')

  if (!updated) {
    throw new AppError(404, 'Task not found.')
  }

  const brokerageId = (existing as TaskDocument).brokerageId.toString()
  const serialized = serializeTask(updated as TaskDocument)

  const action = patch.status === 'COMPLETED' ? 'completed' : 'updated'
  publishTaskEvent(action, brokerageId, serialized.id, serialized)

  return serialized
}

export async function deleteTask(user: AuthenticatedUser, taskId: string) {
  if (user.role === ROLES.CLIENT) {
    throw new AppError(403, 'Clients cannot delete tasks.')
  }

  const existing = await getTask(user, taskId)
  const brokerageId = (existing as TaskDocument).brokerageId.toString()

  await Task.deleteOne({ _id: taskId })
  publishTaskEvent('deleted', brokerageId, taskId, null)
}