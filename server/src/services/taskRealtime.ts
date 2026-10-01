import type { Types } from 'mongoose'

export interface TaskRealtimeEvent {
  action: 'created' | 'updated' | 'completed' | 'deleted'
  brokerageId: string
  taskId: string
  task: TaskEventData | null
}

export interface TaskEventData {
  id: string
  leadId: string | null
  clientId: string | null
  assignedAdvisorId: string
  title: string
  description: string | null
  dueDate: string
  status: string
  source: string
  triggerStage: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

let taskRealtimePublisher: ((event: TaskRealtimeEvent) => void) | null = null

export function setTaskRealtimePublisher(publisher: ((event: TaskRealtimeEvent) => void) | null): void {
  taskRealtimePublisher = publisher
}

export function publishTaskEvent(
  action: TaskRealtimeEvent['action'],
  brokerageId: string,
  taskId: string,
  task: TaskEventData | null,
): void {
  taskRealtimePublisher?.({ action, brokerageId, taskId, task })
}

export function serializeTaskForRealtime(task: {
  _id: Types.ObjectId
  brokerageId: Types.ObjectId
  leadId: Types.ObjectId | null
  clientId: Types.ObjectId | null
  assignedAdvisorId: Types.ObjectId
  title: string
  description: string | null
  dueDate: Date
  status: string
  source: string
  triggerStage: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): TaskEventData {
  return {
    id: task._id.toString(),
    leadId: task.leadId?.toString() ?? null,
    clientId: task.clientId?.toString() ?? null,
    assignedAdvisorId: task.assignedAdvisorId.toString(),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate.toISOString(),
    status: task.status,
    source: task.source,
    triggerStage: task.triggerStage,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}