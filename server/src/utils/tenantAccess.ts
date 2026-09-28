import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { ROLES } from '../models/roles.js'
import { AppError } from './AppError.js'

export function canAccessBrokerage(user: AuthenticatedUser, brokerageId: string): boolean {
  return user.role === ROLES.PLATFORM_ADMIN
    || user.brokerageId?.toLowerCase() === brokerageId.toLowerCase()
}

export function assertBrokerageAccess(user: AuthenticatedUser, brokerageId: string): void {
  if (!canAccessBrokerage(user, brokerageId)) {
    throw new AppError(403, 'You are not allowed to access this brokerage.')
  }
}

export function assertClientRecordAccess(
  user: AuthenticatedUser,
  brokerageId: string,
  clientUserId: string,
): void {
  assertBrokerageAccess(user, brokerageId)
  if (user.role === ROLES.CLIENT && user.id !== clientUserId) {
    throw new AppError(403, 'Clients can only access their own records.')
  }
}