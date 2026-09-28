import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../models/roles.js'
import { AppError } from '../utils/AppError.js'

export function requireRole(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new AppError(401, 'Authentication required.'))
      return
    }
    if (!allowedRoles.includes(request.user.role)) {
      next(new AppError(403, 'You are not allowed to perform this action.'))
      return
    }
    next()
  }
}