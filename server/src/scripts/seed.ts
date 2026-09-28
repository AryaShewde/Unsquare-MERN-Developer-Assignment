import 'dotenv/config'
import mongoose from 'mongoose'
import { connectToDatabase } from '../config/database.js'
import { Brokerage } from '../models/Brokerage.js'
import { ROLES, type UserRole } from '../models/roles.js'
import { User } from '../models/User.js'
import { hashPassword } from '../services/passwordService.js'

const demoPassword = 'LeadflowDemo!2026'

async function seed(): Promise<void> {
  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error('Set MONGODB_URI in server/.env before running the seed script.')
  }

  await connectToDatabase()
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected; seed operation cancelled.')
  }

  const brokerageA = await Brokerage.findOneAndUpdate(
    { name: 'Demo Brokerage A' },
    { $setOnInsert: { name: 'Demo Brokerage A' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  const brokerageB = await Brokerage.findOneAndUpdate(
    { name: 'Demo Brokerage B' },
    { $setOnInsert: { name: 'Demo Brokerage B' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  const passwordHash = await hashPassword(demoPassword)
  const demoUsers: Array<{ name: string; email: string; role: UserRole; brokerageId: mongoose.Types.ObjectId | null }> = [
    { name: 'Platform Admin', email: 'platform.admin@leadflow.local', role: ROLES.PLATFORM_ADMIN, brokerageId: null },
    { name: 'Brokerage A Admin', email: 'admin.a@leadflow.local', role: ROLES.BROKERAGE_ADMIN, brokerageId: brokerageA._id },
    { name: 'Brokerage A Advisor', email: 'advisor.a@leadflow.local', role: ROLES.ADVISOR, brokerageId: brokerageA._id },
    { name: 'Brokerage A Client', email: 'client.a@leadflow.local', role: ROLES.CLIENT, brokerageId: brokerageA._id },
    { name: 'Brokerage B Admin', email: 'admin.b@leadflow.local', role: ROLES.BROKERAGE_ADMIN, brokerageId: brokerageB._id },
    { name: 'Brokerage B Advisor', email: 'advisor.b@leadflow.local', role: ROLES.ADVISOR, brokerageId: brokerageB._id },
    { name: 'Brokerage B Client', email: 'client.b@leadflow.local', role: ROLES.CLIENT, brokerageId: brokerageB._id },
  ]

  for (const demoUser of demoUsers) {
    await User.findOneAndUpdate(
      { email: demoUser.email },
      { $set: { ...demoUser, passwordHash } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    )
  }

  console.info(`Seeded ${demoUsers.length} development users across two demo brokerages.`)
}

seed()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Seed failed.')
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })