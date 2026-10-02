import { processNextVerificationJob } from '../../src/services/verificationWorker.js'
import { connectToDatabase } from '../../src/config/database.js'
import { AppError } from '../../src/utils/AppError.js'

// Vercel Cron Trigger
export default async (req: any, res: any) => {
  const authHeader = req.headers.authorization
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET) {
      return res.status(500).json({ error: 'Cron secret not configured.' })
  }

  if (authHeader !== expectedAuth) {
      return res.status(401).json({ error: 'Unauthorized.' })
  }

  await connectToDatabase()
  await processNextVerificationJob()
  res.status(200).json({ success: true })
}
