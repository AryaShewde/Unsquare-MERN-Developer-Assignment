import type { NextFunction, Request, Response } from 'express'
import { findWebhookBrokerageId } from '../services/webhookSecretService.js'
import { AppError } from '../utils/AppError.js'

export async function requireWebhookSecret(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const token = request.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    ?? (typeof request.query.token === 'string' ? request.query.token : null)

  if (!token) {
    console.error('Webhook credential required.')
    next(new AppError(401, 'Webhook credential required.'))
    return
  }
  try {
    request.webhookBrokerageId = await findWebhookBrokerageId(token)
    next()
  } catch (error) {
    console.error('Webhook auth failed:', error)
    next(error)
  }
}