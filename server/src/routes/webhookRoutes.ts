import { Router } from 'express'
import { createWebhookLeadController } from '../controllers/leadController.js'
import { requireWebhookSecret } from '../middleware/requireWebhookSecret.js'

export const webhookRouter = Router()

webhookRouter.post('/leads', requireWebhookSecret, createWebhookLeadController)