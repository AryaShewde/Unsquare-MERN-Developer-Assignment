import { app } from '../src/app.js'
import { connectToDatabase } from '../src/config/database.js'

export default async (req: any, res: any) => {
  await connectToDatabase()
  return app(req, res)
}
