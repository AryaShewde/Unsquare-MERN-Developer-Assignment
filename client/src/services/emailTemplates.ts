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

export interface EmailTemplate {
  id: string
  brokerageId: string
  name: string
  subject: string
  body: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchEmailTemplates(token: string): Promise<EmailTemplate[]> {
  const result = await request<{ templates: EmailTemplate[] }>(token, '/api/email-templates')
  return result.templates
}

export async function createEmailTemplate(
  token: string,
  template: { name: string; subject: string; body: string; active?: boolean },
): Promise<EmailTemplate> {
  const result = await request<{ template: EmailTemplate }>(token, '/api/email-templates', {
    method: 'POST',
    body: JSON.stringify(template),
  })
  return result.template
}

export async function updateEmailTemplate(
  token: string,
  templateId: string,
  patch: { name?: string; subject?: string; body?: string; active?: boolean },
): Promise<EmailTemplate> {
  const result = await request<{ template: EmailTemplate }>(token, `/api/email-templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return result.template
}

export async function deleteEmailTemplate(token: string, templateId: string): Promise<void> {
  await request(token, `/api/email-templates/${templateId}`, { method: 'DELETE' })
}