export type EmailTemplate = {
  id: string
  brokerageId: string
  name: string
  subject: string
  body: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type EmailTrigger = {
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

export type TaskTrigger = {
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

export type Task = {
  id: string
  brokerageId: string
  leadId: string | null
  clientId: string | null
  assignedAdvisorId: string
  title: string
  description: string | null
  dueDate: string
  status: 'OPEN' | 'COMPLETED'
  source: 'MANUAL' | 'STAGE_TRIGGER'
  triggerStage: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}