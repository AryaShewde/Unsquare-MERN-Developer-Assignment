import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/authRoutes.js'
import { healthRouter } from './routes/healthRoutes.js'
import { userRouter } from './routes/userRoutes.js'
import { leadRouter } from './routes/leadRoutes.js'
import { brokerageWebhookRouter } from './routes/brokerageWebhookRoutes.js'
import { webhookRouter } from './routes/webhookRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/leads', leadRouter)
app.use('/api/brokerages', brokerageWebhookRouter)
app.use('/api/webhooks', webhookRouter)

app.use(errorHandler)