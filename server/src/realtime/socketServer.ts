import type { Server as HttpServer } from 'node:http'
import { Server, type Socket } from 'socket.io'
import { User } from '../models/User.js'
import { ROLES } from '../models/roles.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { verifyToken } from '../services/tokenService.js'
import { setLeadRealtimePublisher, type LeadRealtimeEvent } from '../services/leadService.js'
import { setDocumentRealtimePublisher, type DocumentStatusEvent } from '../services/documentRealtime.js'

const PLATFORM_ROOM = 'leadflow:platform-admins'

function brokerageRoom(brokerageId: string): string {
  return `leadflow:brokerage:${brokerageId}`
}

function clientRoom(clientId: string): string {
  return `leadflow:client:${clientId}`
}

export function attachSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL ?? 'http://localhost:5173' },
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (typeof token !== 'string' || token.length === 0) {
      next(new Error('Authentication required.'))
      return
    }

    try {
      const userId = verifyToken(token)
      const user = await User.findById(userId).select('name email role brokerageId')
      if (!user) {
        next(new Error('Not authorized for pipeline updates.'))
        return
      }

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        brokerageId: user.brokerageId?.toString() ?? null,
      }
      if (authenticatedUser.role !== ROLES.PLATFORM_ADMIN && !authenticatedUser.brokerageId) {
        next(new Error('A brokerage is required.'))
        return
      }
      socket.data.user = authenticatedUser
      next()
    } catch {
      next(new Error('Invalid or expired token.'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthenticatedUser
    if (user.role === ROLES.PLATFORM_ADMIN) {
      socket.join(PLATFORM_ROOM)
    } else if (user.role === ROLES.CLIENT) {
      socket.join(clientRoom(user.id))
    } else if (user.brokerageId) {
      socket.join(brokerageRoom(user.brokerageId))
    }
  })

  setLeadRealtimePublisher((event: LeadRealtimeEvent) => {
    io.to(brokerageRoom(event.brokerageId)).emit('pipeline:update', event)
    io.to(PLATFORM_ROOM).emit('pipeline:update', event)
  })

  setDocumentRealtimePublisher((event: DocumentStatusEvent) => {
    io.to(clientRoom(event.clientId)).emit('document:update', event)
    io.to(brokerageRoom(event.brokerageId)).emit('document:update', event)
    io.to(PLATFORM_ROOM).emit('document:update', event)
  })

  io.on('close', () => {
    setLeadRealtimePublisher(null)
    setDocumentRealtimePublisher(null)
  })
  return io
}