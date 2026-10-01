const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const body: unknown = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'The request could not be completed.'
    throw new Error(error)
  }
  return body as T
}

export interface Task {
  id: string
  brokerageId: string
  leadId: string | null
  clientId: string | null
  assignedAdvisorId: string
  title: string
  description: string | null
  dueDate: string
  status: 'OPEN' | 'COMPLETED'
  source: 'MANUAL' | 'STAGE_TRIGGER'
  triggerStage: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export async function fetchTasks(token: string): Promise<Task[]> {
  const result = await request<{ tasks: Task[] }>(token, '/api/tasks')
  return result.tasks
}

export async function createTask(
  token: string,
  task: {
    leadId?: string
    clientId?: string
    assignedAdvisorId: string
    title: string
    description?: string
    dueDate: string
  },
): Promise<Task> {
  const result = await request<{ task: Task }>(token, '/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })
  return result.task
}

export async function updateTask(
  token: string,
  taskId: string,
  patch: { title?: string; description?: string; dueDate?: string; status?: 'OPEN' | 'COMPLETED' },
): Promise<Task> {
  const result = await request<{ task: Task }>(token, `/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return result.task
}

export async function deleteTask(token: string, taskId: string): Promise<void> {
  await request(token, `/api/tasks/${taskId}`, { method: 'DELETE' })
}

export async function completeTask(token: string, taskId: string): Promise<Task> {
  return updateTask(token, taskId, { status: 'COMPLETED' })
}