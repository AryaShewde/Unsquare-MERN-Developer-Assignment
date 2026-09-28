import type { NextFunction, Request, Response } from 'express'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../services/tokenService.js'

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const authorization = request.header('authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    next(new AppError(401, 'Authentication required.'))
    return
  }

  let userId: string
  try {
    userId = verifyToken(token)
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }
    next(new AppError(401, 'Invalid or expired token.'))
    return
  }

  const user = await User.findById(userId).select('name email role brokerageId')
  if (!user) {
    next(new AppError(401, 'Invalid or expired token.'))
    return
  }

  request.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    brokerageId: user.brokerageId?.toString() ?? null,
  }
  next()
}