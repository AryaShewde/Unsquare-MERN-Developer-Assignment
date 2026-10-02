import { processNextVerificationJob } from '../../src/services/verificationWorker.js'
import { connectToDatabase } from '../../src/config/database.js'

export default async (req: any, res: any) => {
  const authHeader = req.headers.authorization
  const expectedAuth = \Bearer \\

  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  await connectToDatabase()
  await processNextVerificationJob()

  res.status(200).json({ success: true })
}
