import mongoose from 'mongoose'

export type DatabaseStatus = 'connected' | 'disconnected' | 'not_configured'

export async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim()

  if (!uri) {
    console.warn('MONGODB_URI is not configured; continuing without MongoDB.')
    return
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.info('Connected to MongoDB.')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`MongoDB connection failed: ${message}`)
  }
}

export function getDatabaseStatus(): DatabaseStatus {
  if (mongoose.connection.readyState === 1) {
    return 'connected'
  }

  return process.env.MONGODB_URI?.trim() ? 'disconnected' : 'not_configured'
}