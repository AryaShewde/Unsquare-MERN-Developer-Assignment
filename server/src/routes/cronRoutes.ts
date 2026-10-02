import { Router } from 'express'
import { processNextVerificationJob } from '../services/verificationWorker.js'
import { AppError } from '../utils/AppError.js'

export const cronRouter = Router()

cronRouter.post('/verify', async (req, res, next) => {
  const authHeader = req.headers.authorization
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    return next(new AppError(401, 'Unauthorized.'))
  }
  await processNextVerificationJob()
  res.status(200).json({ success: true })
})
