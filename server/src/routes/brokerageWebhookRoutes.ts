import { Router } from 'express'
import { rotateBrokerageWebhookSecret } from '../controllers/brokerageWebhookController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

export const brokerageWebhookRouter = Router()

brokerageWebhookRouter.post(
  '/:brokerageId/lead-webhook-token',
  requireAuth,
  requireRole(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN),
  rotateBrokerageWebhookSecret,
)