import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { io, type Socket } from 'socket.io-client'
import type { Server as SocketServer } from 'socket.io'
import { app } from '../src/app.js'
import { Brokerage } from '../src/models/Brokerage.js'
import { Lead } from '../src/models/Lead.js'
import { ROLES, type UserRole } from '../src/models/roles.js'
import { User } from '../src/models/User.js'
import { hashPassword } from '../src/services/passwordService.js'
import { attachSocketServer } from '../src/realtime/socketServer.js'
import { setLeadRealtimePublisher } from '../src/services/leadService.js'

const password = 'PhaseThreeTest!2026'
let mongo: MongoMemoryServer
let httpServer: HttpServer
let socketServer: SocketServer
let socketUrl: string
let brokerageAId: string
let brokerageBId: string
let adminAToken: string
let advisorAToken: string
let clientAToken: string
let adminBToken: string
let platformToken: string
let advisorAId: string
let leadSequence = 0

const accounts: Array<{ email: string; role: UserRole; brokerage: 'A' | 'B' | null }> = [
  { email: 'platform@phase3.test', role: ROLES.PLATFORM_ADMIN, brokerage: null },
  { email: 'admin.a@phase3.test', role: ROLES.BROKERAGE_ADMIN, brokerage: 'A' },
  { email: 'advisor.a@phase3.test', role: ROLES.ADVISOR, brokerage: 'A' },
  { email: 'client.a@phase3.test', role: ROLES.CLIENT, brokerage: 'A' },
  { email: 'admin.b@phase3.test', role: ROLES.BROKERAGE_ADMIN, brokerage: 'B' },
  { email: 'advisor.b@phase3.test', role: ROLES.ADVISOR, brokerage: 'B' },
]

beforeAll(async () => {
  process.env.JWT_SECRET = 'phase-three-test-secret-at-least-thirty-two-characters'
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri(), { dbName: 'leadflow_phase_three_test' })
  await Promise.all([Brokerage.init(), User.init(), Lead.init()])

  const [brokerageA, brokerageB] = await Brokerage.create([
    { name: 'Phase Three Brokerage A' },
    { name: 'Phase Three Brokerage B' },
  ])
  brokerageAId = brokerageA.id
  brokerageBId = brokerageB.id
  const passwordHash = await hashPassword(password)
  for (const account of accounts) {
    const brokerageId = account.brokerage === 'A'
      ? brokerageA._id
      : account.brokerage === 'B' ? brokerageB._id : null
    await User.create({ name: account.email, email: account.email, role: account.role, brokerageId, passwordHash })
  }

  const login = async (email: string) => {
    const response = await request(app).post('/api/auth/login').send({ email, password })
    if (response.status !== 200) throw new Error(`Could not prepare ${email} for the integration test.`)
    return response.body as { token: string; user: { id: string } }
  }
  const [platform, adminA, advisorA, clientA, adminB, advisorB] = await Promise.all([
    login('platform@phase3.test'),
    login('admin.a@phase3.test'),
    login('advisor.a@phase3.test'),
    login('client.a@phase3.test'),
    login('admin.b@phase3.test'),
    login('advisor.b@phase3.test'),
  ])
  platformToken = platform.token
  adminAToken = adminA.token
  advisorAToken = advisorA.token
  clientAToken = clientA.token
  adminBToken = adminB.token
  advisorAId = advisorA.user.id
  void advisorB

  httpServer = createServer(app)
  socketServer = attachSocketServer(httpServer)
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
  const address = httpServer.address() as AddressInfo
  socketUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  if (socketServer) {
    await new Promise<void>((resolve) => socketServer.close(() => resolve()))
  }
  if (httpServer?.listening) {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
  }
  setLeadRealtimePublisher(null)
  await mongoose.disconnect()
  await mongo.stop()
})

function leadPayload(overrides: Record<string, unknown> = {}) {
  leadSequence += 1
  return {
    firstName: 'Morgan',
    lastName: 'Lee',
    email: `morgan.${leadSequence}@example.test`,
    phone: `+1 (555) 100-${String(leadSequence).padStart(4, '0')}`,
    source: 'Website',
    ...overrides,
  }
}

async function createLead(token = adminAToken, payload = leadPayload()) {
  return request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(payload)
}

async function connectedSocket(token: string): Promise<Socket> {
  const socket = io(socketUrl, { auth: { token }, transports: ['websocket'], reconnection: false })
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('connect_error', reject)
  })
  return socket
}

describe('lead CRUD and tenant isolation', () => {
  it('creates, lists, gets, updates, moves, assigns, and deletes a scoped lead', async () => {
    const created = await createLead()
    expect(created.status).toBe(201)
    expect(created.body.lead.brokerageId).toBe(brokerageAId)
    expect(created.body.lead.status).toBe('NEW')
    expect(created.body.lead).not.toHaveProperty('emailNormalized')
    const leadId = created.body.lead.id as string

    const listA = await request(app).get('/api/leads').set('Authorization', `Bearer ${adminAToken}`)
    const listB = await request(app).get('/api/leads').set('Authorization', `Bearer ${adminBToken}`)
    expect(listA.body.leads.some((lead: { id: string }) => lead.id === leadId)).toBe(true)
    expect(listB.body.leads).toHaveLength(0)

    const crossTenant = await request(app).get(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminBToken}`)
    expect(crossTenant.status).toBe(404)
    expect((await request(app).get(`/api/leads?brokerageId=${brokerageAId}`).set('Authorization', `Bearer ${adminBToken}`)).status).toBe(403)
    expect((await request(app).patch(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminBToken}`).send({ notes: 'Cross tenant' })).status).toBe(404)
    expect((await request(app).patch(`/api/leads/${leadId}/status`).set('Authorization', `Bearer ${adminBToken}`)
      .send({ status: 'LOST', expectedUpdatedAt: created.body.lead.updatedAt })).status).toBe(404)
    expect((await request(app).delete(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminBToken}`)).status).toBe(404)

    const updated = await request(app).patch(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminAToken}`)
      .send({ notes: 'Called once', firstName: 'Morgan S.' })
    expect(updated.status).toBe(200)
    expect(updated.body.lead.notes).toBe('Called once')

    const assigned = await request(app).patch(`/api/leads/${leadId}/assignment`).set('Authorization', `Bearer ${adminAToken}`)
      .send({ assignedAdvisorId: advisorAId })
    expect(assigned.status).toBe(200)
    expect(assigned.body.lead.assignedAdvisorId).toBe(advisorAId)
    expect(assigned.body.lead.assignedAdvisorName).toBe('advisor.a@phase3.test')

    const moved = await request(app).patch(`/api/leads/${leadId}/status`).set('Authorization', `Bearer ${advisorAToken}`)
      .send({ status: 'CONTACTED', expectedUpdatedAt: assigned.body.lead.updatedAt })
    expect(moved.status).toBe(200)
    expect(moved.body.lead.status).toBe('CONTACTED')

    const forbiddenDelete = await request(app).delete(`/api/leads/${leadId}`).set('Authorization', `Bearer ${advisorAToken}`)
    expect(forbiddenDelete.status).toBe(403)
    expect((await request(app).delete(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminAToken}`)).status).toBe(204)
  })

  it('derives brokerage from the authenticated user and blocks request-body tenant changes', async () => {
    const invalidPhone = await createLead(adminAToken, leadPayload({ email: 'invalid.phone@example.test', phone: '----------' }))
    expect(invalidPhone.status).toBe(400)

    const denied = await createLead(adminAToken, leadPayload({ brokerageId: brokerageBId }))
    expect(denied.status).toBe(403)

    const created = await createLead(advisorAToken, leadPayload({ email: 'derived.a@example.test' }))
    expect(created.status).toBe(201)
    expect(created.body.lead.brokerageId).toBe(brokerageAId)

    const clientDenied = await createLead(clientAToken, leadPayload({ email: 'client.lead@example.test' }))
    expect(clientDenied.status).toBe(403)
    expect((await request(app).get('/api/leads').set('Authorization', `Bearer ${clientAToken}`)).status).toBe(403)
  })

  it('allows Platform Admin to query and create leads across brokerages intentionally', async () => {
    const leadA = await createLead(adminAToken, leadPayload({ email: 'platform-visible-a@example.test' }))
    const leadB = await createLead(adminBToken, leadPayload({ email: 'platform-visible-b@example.test' }))
    const allLeads = await request(app).get('/api/leads').set('Authorization', `Bearer ${platformToken}`)
    expect(allLeads.status).toBe(200)
    expect(allLeads.body.leads.some((lead: { id: string }) => lead.id === leadA.body.lead.id)).toBe(true)
    expect(allLeads.body.leads.some((lead: { id: string }) => lead.id === leadB.body.lead.id)).toBe(true)

    const createdForB = await createLead(platformToken, leadPayload({
      email: 'platform-created-b@example.test',
      brokerageId: brokerageBId,
    }))
    expect(createdForB.status).toBe(201)
    expect(createdForB.body.lead.brokerageId).toBe(brokerageBId)
  })

  it('does not assign an advisor from another brokerage', async () => {
    const created = await createLead()
    const otherAdvisor = await User.findOne({ email: 'advisor.b@phase3.test' }).select('_id')
    const response = await request(app).patch(`/api/leads/${created.body.lead.id}/assignment`)
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({ assignedAdvisorId: otherAdvisor?.id })
    expect(response.status).toBe(400)
  })

  it('rejects stale concurrent status changes without overwriting the winning value', async () => {
    const created = await createLead()
    const staleUpdatedAt = created.body.lead.updatedAt
    const leadId = created.body.lead.id as string
    const results = await Promise.all([
      request(app).patch(`/api/leads/${leadId}/status`).set('Authorization', `Bearer ${adminAToken}`)
        .send({ status: 'QUALIFIED', expectedUpdatedAt: staleUpdatedAt }),
      request(app).patch(`/api/leads/${leadId}/status`).set('Authorization', `Bearer ${advisorAToken}`)
        .send({ status: 'APPLICATION', expectedUpdatedAt: staleUpdatedAt }),
    ])
    expect(results.map((result) => result.status).sort()).toEqual([200, 409])
    const stored = await request(app).get(`/api/leads/${leadId}`).set('Authorization', `Bearer ${adminAToken}`)
    expect(['QUALIFIED', 'APPLICATION']).toContain(stored.body.lead.status)
  })
})

describe('duplicate leads and webhook', () => {
  it('detects duplicate email and normalized phone within a brokerage but permits another brokerage', async () => {
    const first = await createLead(adminAToken, leadPayload({ email: 'duplicate@example.test', phone: '+1 555 111 2222' }))
    expect(first.status).toBe(201)

    const duplicateEmail = await createLead(adminAToken, leadPayload({ email: 'DUPLICATE@example.test', phone: '+1 555 111 3333' }))
    expect(duplicateEmail.status).toBe(409)
    expect(duplicateEmail.body.duplicateLead.id).toBe(first.body.lead.id)
    expect(duplicateEmail.body.duplicateLead.brokerageId).toBe(brokerageAId)

    const duplicatePhone = await createLead(adminAToken, leadPayload({ email: 'different@example.test', phone: '1 (555) 111-2222' }))
    expect(duplicatePhone.status).toBe(409)

    const sameEmailInBrokerageB = await createLead(adminBToken, leadPayload({ email: 'duplicate@example.test', phone: '+1 555 111 4444' }))
    expect(sameEmailInBrokerageB.status).toBe(201)
    expect(sameEmailInBrokerageB.body.lead.brokerageId).toBe(brokerageBId)
  })

  it('authenticates a brokerage-specific webhook, derives tenant, and deduplicates event retries', async () => {
    const crossTenantRotation = await request(app).post(`/api/brokerages/${brokerageBId}/lead-webhook-token`)
      .set('Authorization', `Bearer ${adminAToken}`)
    expect(crossTenantRotation.status).toBe(403)

    const tokenResponse = await request(app).post(`/api/brokerages/${brokerageAId}/lead-webhook-token`)
      .set('Authorization', `Bearer ${adminAToken}`)
    expect(tokenResponse.status).toBe(201)
    const webhookToken = tokenResponse.body.token as string
    const storedBrokerage = await Brokerage.findById(brokerageAId).select('+leadWebhookSecretHash')
    expect(storedBrokerage?.leadWebhookSecretHash).not.toBe(webhookToken)
    expect(storedBrokerage?.leadWebhookSecretHash).toEqual(expect.any(String))

    const invalid = await request(app).post('/api/webhooks/leads').set('Authorization', 'Bearer invalid-webhook-token')
      .send(leadPayload({ email: 'webhook@example.test' }))
    expect(invalid.status).toBe(401)

    const invalidPayload = await request(app).post('/api/webhooks/leads')
      .set('Authorization', `Bearer ${webhookToken}`)
      .send({ firstName: 'Missing fields' })
    expect(invalidPayload.status).toBe(400)

    const webhookPayload = leadPayload({
      email: 'webhook@example.test',
      phone: '+1 555 200 0001',
      eventId: 'provider-event-123',
      brokerageId: brokerageBId,
    })
    const created = await request(app).post('/api/webhooks/leads').set('Authorization', `Bearer ${webhookToken}`).send(webhookPayload)
    expect(created.status).toBe(201)
    expect(created.body.lead.brokerageId).toBe(brokerageAId)

    const repeated = await request(app).post('/api/webhooks/leads').set('Authorization', `Bearer ${webhookToken}`).send(webhookPayload)
    expect(repeated.status).toBe(200)
    expect(repeated.body.duplicateEvent).toBe(true)
    expect(repeated.body.lead.id).toBe(created.body.lead.id)

    const personDuplicate = await request(app).post('/api/webhooks/leads').set('Authorization', `Bearer ${webhookToken}`)
      .send({ ...webhookPayload, eventId: 'provider-event-124' })
    expect(personDuplicate.status).toBe(409)
  })
})

describe('Socket.IO pipeline isolation', () => {
  it('sends brokerage A lead events to A, not B', async () => {
    const socketA = await connectedSocket(adminAToken)
    const socketB = await connectedSocket(adminBToken)
    const eventsB: unknown[] = []
    socketB.on('pipeline:update', (event) => eventsB.push(event))
    const eventA = new Promise<{ action: string; brokerageId: string }>((resolve) => {
      socketA.once('pipeline:update', resolve)
    })

    const created = await createLead(adminAToken, leadPayload({ email: 'socket-a@example.test' }))
    const event = await Promise.race([
      eventA,
      new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error('Socket event timed out.')), 1500)),
    ])
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(event.action).toBe('created')
      expect(event.brokerageId).toBe(brokerageAId)
      expect(created.status).toBe(201)
      expect(eventsB).toHaveLength(0)
    } finally {
      socketA.disconnect()
      socketB.disconnect()
    }
  })

  it('allows Client sockets without granting brokerage-wide pipeline events', async () => {
    const client = await connectedSocket(clientAToken)
    const events: unknown[] = []
    client.on('pipeline:update', (event) => events.push(event))
    await createLead(adminAToken, leadPayload({ email: 'client-socket-no-pipeline@example.test' }))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(events).toHaveLength(0)
    client.disconnect()
  })
})