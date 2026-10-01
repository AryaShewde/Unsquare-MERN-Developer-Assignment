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

export interface EmailTrigger {
  id: string
  brokerageId: string
  stage: string
  templateId: string
  templateName?: string
  templateSubject?: string
  templateActive?: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchEmailTriggers(token: string): Promise<EmailTrigger[]> {
  const result = await request<{ triggers: EmailTrigger[] }>(token, '/api/email-triggers')
  return result.triggers
}

export async function createEmailTrigger(
  token: string,
  trigger: { stage: string; templateId: string; active?: boolean },
): Promise<EmailTrigger> {
  const result = await request<{ trigger: EmailTrigger }>(token, '/api/email-triggers', {
    method: 'POST',
    body: JSON.stringify(trigger),
  })
  return result.trigger
}

export async function updateEmailTrigger(
  token: string,
  triggerId: string,
  patch: { stage?: string; templateId?: string; active?: boolean },
): Promise<EmailTrigger> {
  const result = await request<{ trigger: EmailTrigger }>(token, `/api/email-triggers/${triggerId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return result.trigger
}

export async function deleteEmailTrigger(token: string, triggerId: string): Promise<void> {
  await request(token, `/api/email-triggers/${triggerId}`, { method: 'DELETE' })
}