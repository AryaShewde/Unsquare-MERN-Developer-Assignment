import { createHash, randomBytes } from 'node:crypto'
import { Brokerage } from '../models/Brokerage.js'
import { AppError } from '../utils/AppError.js'

export function hashWebhookSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

export async function rotateLeadWebhookSecret(brokerageId: string): Promise<string> {
  const secret = randomBytes(32).toString('base64url')
  const brokerage = await Brokerage.findByIdAndUpdate(
    brokerageId,
    { $set: { leadWebhookSecretHash: hashWebhookSecret(secret) } },
    { new: true },
  ).select('_id')
  if (!brokerage) throw new AppError(404, 'Brokerage not found.')
  return secret
}

export async function findWebhookBrokerageId(secret: string): Promise<string> {
  const brokerage = await Brokerage.findOne({ leadWebhookSecretHash: hashWebhookSecret(secret) }).select('_id')
  if (!brokerage) throw new AppError(401, 'Invalid webhook credential.')
  return brokerage.id
}