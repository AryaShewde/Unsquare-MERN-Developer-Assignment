import type { Lead, LeadAdvisor, LeadBrokerage, LeadConversionResult, LeadStatus } from '../types/lead'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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

export async function fetchLeads(token: string): Promise<Lead[]> {
  const result = await request<{ leads: Lead[] }>(token, '/api/leads')
  return result.leads
}

export async function fetchLeadSummary(token: string) {
  return request<Record<string, number>>(token, '/api/leads/summary')
}

export async function fetchLeadAdvisors(token: string): Promise<LeadAdvisor[]> {
  const result = await request<{ advisors: LeadAdvisor[] }>(token, '/api/leads/advisors')
  return result.advisors
}

export async function fetchLeadBrokerages(token: string): Promise<LeadBrokerage[]> {
  const result = await request<{ brokerages: LeadBrokerage[] }>(token, '/api/leads/brokerages')
  return result.brokerages
}

export async function createLeadRequest(
  token: string,
  lead: { firstName: string; lastName: string; email: string; phone: string; source: string; brokerageId?: string },
): Promise<Lead> {
  const result = await request<{ lead: Lead }>(token, '/api/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  })
  return result.lead
}

export async function updateLeadStatus(
  token: string,
  lead: Lead,
  status: LeadStatus,
): Promise<Lead> {
  const result = await request<{ lead: Lead }>(token, `/api/leads/${lead.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, expectedUpdatedAt: lead.updatedAt }),
  })
  return result.lead
}

export async function updateLeadAssignment(
  token: string,
  leadId: string,
  assignedAdvisorId: string | null,
): Promise<Lead> {
  const result = await request<{ lead: Lead }>(token, `/api/leads/${leadId}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedAdvisorId }),
  })
  return result.lead
}

export async function convertLead(token: string, leadId: string): Promise<LeadConversionResult> {
  return request<LeadConversionResult>(token, `/api/leads/${leadId}/convert`, { method: 'POST' })
}