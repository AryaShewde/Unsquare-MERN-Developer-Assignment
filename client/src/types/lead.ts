export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPLICATION', 'WON', 'LOST'] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export interface Lead {
  id: string
  brokerageId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  source: string
  status: LeadStatus
  assignedAdvisorId: string | null
  assignedAdvisorName: string | null
  convertedCaseId: string | null
  convertedAt: string | null
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LeadAdvisor {
  id: string
  name: string
  email: string
  brokerageId: string | null
}

export interface LeadBrokerage {
  _id: string
  name: string
}

export interface LeadConversionResult {
  client: { id: string; name: string; email: string; role: 'CLIENT'; brokerageId: string | null; brokerageName: string | null }
  clientCase: { id: string; brokerageId: string; leadId: string; clientUserId: string; applicationStatus: string }
  temporaryPassword: string
  lead: Lead
}