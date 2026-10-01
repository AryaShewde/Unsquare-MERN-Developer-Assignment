import type { ClientCaseSummary, ClientDocument, ClientWithCases } from '../types/documents'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error('Could not connect to the LeadFlow API.')
  }

  const body: unknown = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'The request could not be completed.'
    throw new Error(error)
  }
  return body as T
}

export async function fetchMyCases(token: string): Promise<ClientCaseSummary[]> {
  return (await request<{ cases: ClientCaseSummary[] }>(token, '/api/clients/me/cases')).cases
}

export async function fetchMyDocuments(token: string): Promise<ClientDocument[]> {
  return (await request<{ documents: ClientDocument[] }>(token, '/api/clients/me/documents')).documents
}

export async function fetchClients(token: string): Promise<ClientWithCases[]> {
  return (await request<{ clients: ClientWithCases[] }>(token, '/api/clients')).clients
}

export async function fetchCaseDocuments(token: string, caseId: string): Promise<ClientDocument[]> {
  return (await request<{ documents: ClientDocument[] }>(token, `/api/cases/${caseId}/documents`)).documents
}

export async function uploadDocument(token: string, file: File, documentType: string): Promise<ClientDocument> {
  const body = new FormData()
  body.append('file', file)
  body.append('documentType', documentType)
  return (await request<{ document: ClientDocument }>(token, '/api/clients/me/documents', { method: 'POST', body })).document
}

export async function retryDocument(token: string, documentId: string): Promise<ClientDocument> {
  return (await request<{ document: ClientDocument }>(token, `/api/documents/${documentId}/retry`, { method: 'POST' })).document
}

export async function getDocumentDownloadUrl(token: string, documentId: string): Promise<string> {
  return (await request<{ url: string }>(token, `/api/documents/${documentId}/download`)).url
}