import { Router } from 'express'
import express from 'express'
import { createTallyLeadController } from '../controllers/tallyController.js'
import { requireWebhookSecret } from '../middleware/requireWebhookSecret.js'
import { verifyTallySignature } from '../middleware/tallySignatureMiddleware.js'

export const tallyRouter = Router()

// Use raw body parser to capture buffer for HMAC verification
tallyRouter.post('/leads', express.raw({ type: 'application/json' }), requireWebhookSecret, verifyTallySignature, createTallyLeadController)
