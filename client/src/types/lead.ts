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