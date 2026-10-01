import type { VerificationStatus } from '../models/verificationStatus.js'

export interface DocumentStatusEvent {
  action: 'status'
  brokerageId: string
  clientId: string
  caseId: string
  document: {
    id: string
    originalFileName: string
    documentType: string
    verificationStatus: VerificationStatus
    verificationAttempts: number
    verificationError: string | null
    updatedAt: string
  }
}

let publisher: ((event: DocumentStatusEvent) => void) | null = null

export function setDocumentRealtimePublisher(nextPublisher: ((event: DocumentStatusEvent) => void) | null): void {
  publisher = nextPublisher
}

export function publishDocumentStatus(event: DocumentStatusEvent): void {
  publisher?.(event)
}