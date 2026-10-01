export type VerificationStatus = 'UPLOADED' | 'CHECKING' | 'VERIFIED' | 'FAILED'

export interface ClientCaseSummary {
  id: string
  brokerageId: string
  leadId: string
  clientUserId: string
  clientName: string
  clientEmail: string
  advisorId: string | null
  advisorName: string | null
  applicationStatus: string
  createdAt: string
  updatedAt: string
}

export interface ClientWithCases {
  id: string
  name: string
  email: string
  brokerageId: string | null
  cases: ClientCaseSummary[]
}

export interface ClientDocument {
  id: string
  brokerageId: string
  clientId: string
  caseId: string
  uploadedBy: string
  originalFileName: string
  mimeType: string
  size: number
  documentType: string
  verificationStatus: VerificationStatus
  verificationAttempts: number
  verificationError: string | null
  createdAt: string
  updatedAt: string
}