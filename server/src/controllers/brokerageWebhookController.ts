import { Types } from 'mongoose'
import type { Request, Response } from 'express'
import { rotateLeadWebhookSecret } from '../services/webhookSecretService.js'
import { assertBrokerageAccess } from '../utils/tenantAccess.js'
import { AppError } from '../utils/AppError.js'

export async function rotateBrokerageWebhookSecret(request: Request, response: Response): Promise<void> {
  const brokerageId = request.params.brokerageId
  if (typeof brokerageId !== 'string' || !Types.ObjectId.isValid(brokerageId)) {
    throw new AppError(404, 'Brokerage not found.')
  }
  assertBrokerageAccess(request.user!, brokerageId)
  const secret = await rotateLeadWebhookSecret(brokerageId)
  response.status(201).json({ token: secret, warning: 'This token is shown once. Store it securely in the external lead source.' })
}