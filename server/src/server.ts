import 'dotenv/config'
import { createServer } from 'node:http'
import { app } from './app.js'
import { connectToDatabase } from './config/database.js'
import { attachSocketServer } from './realtime/socketServer.js'

const port = Number(process.env.PORT ?? 4000)

void connectToDatabase()

const server = createServer(app)
attachSocketServer(server)

server.listen(port, () => {
  console.info(`LeadFlow API listening on http://localhost:${port}`)
})