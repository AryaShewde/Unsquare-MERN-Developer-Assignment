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

export interface TaskTrigger {
  id: string
  brokerageId: string
  stage: string
  title: string
  description: string | null
  dueDays: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchTaskTriggers(token: string): Promise<TaskTrigger[]> {
  const result = await request<{ triggers: TaskTrigger[] }>(token, '/api/task-triggers')
  return result.triggers
}

export async function createTaskTrigger(
  token: string,
  trigger: { stage: string; title: string; description?: string; dueDays: number; active?: boolean },
): Promise<TaskTrigger> {
  const result = await request<{ trigger: TaskTrigger }>(token, '/api/task-triggers', {
    method: 'POST',
    body: JSON.stringify(trigger),
  })
  return result.trigger
}

export async function updateTaskTrigger(
  token: string,
  triggerId: string,
  patch: { stage?: string; title?: string; description?: string; dueDays?: number; active?: boolean },
): Promise<TaskTrigger> {
  const result = await request<{ trigger: TaskTrigger }>(token, `/api/task-triggers/${triggerId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return result.trigger
}

export async function deleteTaskTrigger(token: string, triggerId: string): Promise<void> {
  await request(token, `/api/task-triggers/${triggerId}`, { method: 'DELETE' })
}