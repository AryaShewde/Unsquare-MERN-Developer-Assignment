import type { LeadStatus } from '../models/leadStatus.js'

export interface LeadSummary {
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