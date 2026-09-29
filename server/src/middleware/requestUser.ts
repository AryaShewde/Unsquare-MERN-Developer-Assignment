import type { UserRole } from '../models/roles.js'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
  brokerageId: string | null
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      webhookBrokerageId?: string
    }
  }
}