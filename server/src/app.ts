import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/authRoutes.js'
import { healthRouter } from './routes/healthRoutes.js'
import { userRouter } from './routes/userRoutes.js'
import { leadRouter } from './routes/leadRoutes.js'
import { brokerageWebhookRouter } from './routes/brokerageWebhookRoutes.js'
import { webhookRouter } from './routes/webhookRoutes.js'
import { clientRouter } from './routes/clientRoutes.js'
import { caseRouter } from './routes/caseRoutes.js'
import { documentRouter } from './routes/documentRoutes.js'
import { emailTemplateRouter } from './routes/emailTemplateRoutes.js'
import { emailTriggerRouter } from './routes/emailTriggerRoutes.js'
import { taskTriggerRouter } from './routes/taskTriggerRoutes.js'
import { taskRouter } from './routes/taskRoutes.js'
import { tallyRouter } from './routes/tallyRoutes.js'
import { cronRouter } from './routes/cronRoutes.js'
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
app.use('/api/tally', tallyRouter)
app.use('/api/cron', cronRouter)
app.use('/api/clients', clientRouter)
app.use('/api/cases', caseRouter)
app.use('/api/documents', documentRouter)
app.use('/api/email-templates', emailTemplateRouter)
app.use('/api/email-triggers', emailTriggerRouter)
app.use('/api/task-triggers', taskTriggerRouter)
app.use('/api/tasks', taskRouter)

app.use(errorHandler)