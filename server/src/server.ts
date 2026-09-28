import 'dotenv/config'
import { app } from './app.js'
import { connectToDatabase } from './config/database.js'

const port = Number(process.env.PORT ?? 4000)

void connectToDatabase()

app.listen(port, () => {
  console.info(`LeadFlow API listening on http://localhost:${port}`)
})