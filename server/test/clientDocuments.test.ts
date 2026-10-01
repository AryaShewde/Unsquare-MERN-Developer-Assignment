import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { io, type Socket } from 'socket.io-client'
import type { Server as SocketServer } from 'socket.io'
import { app } from '../src/app.js'
import { Brokerage } from '../src/models/Brokerage.js'
import { ClientCase } from '../src/models/ClientCase.js'
import { DocumentModel } from '../src/models/Document.js'
import { Lead } from '../src/models/Lead.js'
import { ROLES, type UserRole } from '../src/models/roles.js'
import { User } from '../src/models/User.js'
import { VerificationJob } from '../src/models/VerificationJob.js'
import { hashPassword } from '../src/services/passwordService.js'
import { setObjectStorageAdapter, type ObjectStorageAdapter } from '../src/services/objectStorage.js'
import { processNextVerificationJob } from '../src/services/verificationWorker.js'
import { startVerificationWorker } from '../src/services/verificationWorker.js'
import { setLeadRealtimePublisher } from '../src/services/leadService.js'
import { setDocumentRealtimePublisher } from '../src/services/documentRealtime.js'
import { attachSocketServer } from '../src/realtime/socketServer.js'

const seededPassword = 'PhaseFourSeed!2026'
let mongo: MongoMemoryServer
let httpServer: HttpServer
let socketServer: SocketServer
let socketUrl: string
let brokerageAId: string
let brokerageBId: string
let adminAToken: string
let advisorAToken: string
let advisorBToken: string
let adminBToken: string
let existingClientBToken: string
let advisorAId: string
let clientBId: string
let sequence = 0
const objects = new Map<string, { buffer: Buffer; mimeType: string }>()
const fakeStorage: ObjectStorageAdapter = {
  async put(key, body, contentType) { objects.set(key, { buffer: body, mimeType: contentType }) },
  async signDownload(key) {
    if (!objects.has(key)) throw new Error('Object not found in test store.')
    return `https://private-storage.test/signed/${encodeURIComponent(key)}`
  },
  async delete(key) { objects.delete(key) },
}

const accounts: Array<{ email: string; role: UserRole; brokerage: 'A' | 'B' }> = [
  { email: 'admin.a@phase4.test', role: ROLES.BROKERAGE_ADMIN, brokerage: 'A' },
  { email: 'advisor.a@phase4.test', role: ROLES.ADVISOR, brokerage: 'A' },
  { email: 'advisor.b@phase4.test', role: ROLES.ADVISOR, brokerage: 'B' },
  { email: 'admin.b@phase4.test', role: ROLES.BROKERAGE_ADMIN, brokerage: 'B' },
  { email: 'client.b@phase4.test', role: ROLES.CLIENT, brokerage: 'B' },
]

beforeAll(async () => {
  process.env.JWT_SECRET = 'phase-four-test-secret-has-at-least-32-characters'
  process.env.DOCUMENT_VERIFICATION_DELAY_MS = '300'
  process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
  setObjectStorageAdapter(fakeStorage)
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri(), { dbName: 'leadflow_phase_four_test' })
  await Promise.all([Brokerage.init(), User.init(), Lead.init(), ClientCase.init(), DocumentModel.init(), VerificationJob.init()])

  const [brokerageA, brokerageB] = await Brokerage.create([
    { name: 'Phase Four Brokerage A' },
    { name: 'Phase Four Brokerage B' },
  ])
  brokerageAId = brokerageA.id
  brokerageBId = brokerageB.id
  const passwordHash = await hashPassword(seededPassword)
  const userIds = new Map<string, string>()
  for (const account of accounts) {
    const brokerageId = account.brokerage === 'A' ? brokerageA._id : brokerageB._id
    const user = await User.create({ name: account.email, email: account.email, role: account.role, brokerageId, passwordHash })
    userIds.set(account.email, user.id)
  }
  advisorAId = userIds.get('advisor.a@phase4.test')!
  clientBId = userIds.get('client.b@phase4.test')!

  const login = async (email: string) => {
    const result = await request(app).post('/api/auth/login').send({ email, password: seededPassword })
    if (result.status !== 200) throw new Error(`Test account login failed for ${email}.`)
    return result.body as { token: string }
  }
  const [adminA, advisorA, advisorB, adminB, clientB] = await Promise.all(accounts.map(({ email }) => login(email)))
  adminAToken = adminA.token
  advisorAToken = advisorA.token
  advisorBToken = advisorB.token
  adminBToken = adminB.token
  existingClientBToken = clientB.token

  httpServer = createServer(app)
  socketServer = attachSocketServer(httpServer)
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
  socketUrl = `http://127.0.0.1:${(httpServer.address() as AddressInfo).port}`
})

beforeEach(async () => {
  sequence += 1
  await Promise.all([
    VerificationJob.deleteMany({}),
    DocumentModel.deleteMany({}),
    ClientCase.deleteMany({}),
    Lead.deleteMany({}),
    User.deleteMany({ email: /@converted\.phase4\.test$/ }),
  ])
  objects.clear()
})

afterAll(async () => {
  if (socketServer) await new Promise<void>((resolve) => socketServer.close(() => resolve()))
  if (httpServer?.listening) await new Promise<void>((resolve) => httpServer.close(() => resolve()))
  setLeadRealtimePublisher(null)
  setDocumentRealtimePublisher(null)
  setObjectStorageAdapter(null)
  await mongoose.disconnect()
  await mongo.stop()
})

function leadPayload(brokerage = 'A') {
  sequence += 1
  const suffix = `${sequence}-${randomSuffix()}`
  return {
    firstName: 'Taylor',
    lastName: `Client${sequence}`,
    email: `taylor-${suffix}@converted.phase4.test`,
    phone: `+1 555 777 ${String(sequence).padStart(4, '0')}`,
    source: 'Phase 4 test lead',
    ...(brokerage === 'B' ? { brokerageId: brokerageBId } : {}),
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

async function createLead(token = adminAToken, brokerage = 'A') {
  return request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send(leadPayload(brokerage))
}

async function convertLead(token: string, leadId: string) {
  return request(app).post(`/api/leads/${leadId}/convert`).set('Authorization', `Bearer ${token}`)
}

async function createCaseFor(brokerage: 'A' | 'B' = 'A') {
  const token = brokerage === 'A' ? adminAToken : adminBToken
  const lead = await createLead(token, brokerage)
  expect(lead.status).toBe(201)
  const converted = await convertLead(token, lead.body.lead.id)
  expect(converted.status).toBe(201)
  const login = await request(app).post('/api/auth/login').send({
    email: converted.body.client.email,
    password: converted.body.temporaryPassword,
  })
  expect(login.status).toBe(200)
  return { lead: lead.body.lead, converted: converted.body, clientToken: login.body.token as string }
}

const pdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')

async function uploadPdf(token: string, filename = 'statement.pdf', fields: Record<string, string> = {}) {
  let upload = request(app).post('/api/clients/me/documents').set('Authorization', `Bearer ${token}`)
  for (const [key, value] of Object.entries(fields)) upload = upload.field(key, value)
  return upload.attach('file', pdfBuffer, { filename, contentType: 'application/pdf' })
}

async function connectedSocket(token: string): Promise<Socket> {
  const socket = io(socketUrl, { auth: { token }, transports: ['websocket'], reconnection: false })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Socket connection timed out.')), 2500)
    socket.once('connect', () => { clearTimeout(timeout); resolve() })
    socket.once('connect_error', reject)
  })
  return socket
}

describe('lead-to-client conversion', () => {
  it('allows Advisor and Brokerage Admin conversion and returns a one-time usable client credential', async () => {
    const leadByAdvisor = await createLead(adminAToken)
    const convertedByAdvisor = await convertLead(advisorAToken, leadByAdvisor.body.lead.id)
    expect(convertedByAdvisor.status).toBe(201)
    expect(convertedByAdvisor.body.client.role).toBe('CLIENT')
    expect(convertedByAdvisor.body.client.brokerageId).toBe(brokerageAId)
    expect(convertedByAdvisor.body.client).not.toHaveProperty('passwordHash')
    expect(convertedByAdvisor.body.temporaryPassword).toEqual(expect.any(String))
    expect(convertedByAdvisor.body.lead.status).toBe('WON')
    expect(convertedByAdvisor.body.lead.convertedCaseId).toBe(convertedByAdvisor.body.clientCase.id)

    const login = await request(app).post('/api/auth/login').send({
      email: convertedByAdvisor.body.client.email,
      password: convertedByAdvisor.body.temporaryPassword,
    })
    expect(login.status).toBe(200)
    expect((await request(app).get('/api/clients/me/cases').set('Authorization', `Bearer ${login.body.token}`)).body.cases).toHaveLength(1)
    expect((await convertLead(advisorAToken, leadByAdvisor.body.lead.id)).status).toBe(409)

    const leadByAdmin = await createLead(adminAToken)
    expect((await convertLead(adminAToken, leadByAdmin.body.lead.id)).status).toBe(201)
  })

  it('safely handles two concurrent conversion requests for the same lead', async () => {
    const lead = await createLead(adminAToken)
    const conversions = await Promise.all([
      convertLead(advisorAToken, lead.body.lead.id),
      convertLead(adminAToken, lead.body.lead.id),
    ])
    expect(conversions.map((result) => result.status).sort()).toEqual([201, 409])
    expect(await ClientCase.countDocuments({ leadId: lead.body.lead.id })).toBe(1)
    expect(await User.countDocuments({ email: lead.body.lead.email })).toBe(1)
  })

  it('rejects Client conversion and cross-brokerage conversion', async () => {
    const leadA = await createLead(adminAToken)
    const leadB = await createLead(adminBToken, 'B')
    expect((await convertLead(existingClientBToken, leadA.body.lead.id)).status).toBe(403)
    expect((await convertLead(advisorAToken, leadB.body.lead.id)).status).toBe(404)
  })
})

describe('client and case isolation', () => {
  it('limits clients to their own case and advisors to their own brokerage', async () => {
    const caseA = await createCaseFor('A')
    const caseB = await createCaseFor('B')
    const myCases = await request(app).get('/api/clients/me/cases').set('Authorization', `Bearer ${caseA.clientToken}`)
    expect(myCases.status).toBe(200)
    expect(myCases.body.cases[0].id).toBe(caseA.converted.clientCase.id)

    expect((await request(app).get(`/api/cases/${caseA.converted.clientCase.id}`).set('Authorization', `Bearer ${caseA.clientToken}`)).status).toBe(200)
    expect((await request(app).get(`/api/cases/${caseB.converted.clientCase.id}`).set('Authorization', `Bearer ${caseA.clientToken}`)).status).toBe(404)
    expect((await request(app).get(`/api/clients/${caseB.converted.client.id}/cases`).set('Authorization', `Bearer ${advisorAToken}`)).status).toBe(404)
    expect((await request(app).get(`/api/clients/${caseA.converted.client.id}/cases`).set('Authorization', `Bearer ${advisorAToken}`)).status).toBe(200)
    expect((await request(app).get('/api/leads').set('Authorization', `Bearer ${caseA.clientToken}`)).status).toBe(403)
  })
})

describe('document upload, verification, and access', () => {
  it('returns UPLOADED before async processing, validates files, protects metadata, and signs private downloads', async () => {
    process.env.DOCUMENT_VERIFICATION_DELAY_MS = '250'
    const converted = await createCaseFor('A')
    const uploadStart = Date.now()
    const uploaded = await uploadPdf(converted.clientToken, '..\\private\\income.pdf', {
      documentType: 'INCOME',
      brokerageId: brokerageBId,
      clientId: existingClientBToken,
      verificationStatus: 'VERIFIED',
      caseId: converted.converted.clientCase.id,
    })
    expect(uploaded.status).toBe(201)
    expect(Date.now() - uploadStart).toBeLessThan(250)
    expect(uploaded.body.document.verificationStatus).toBe('UPLOADED')
    expect(uploaded.body.document.brokerageId).toBe(brokerageAId)
    expect(uploaded.body.document.clientId).toBe(converted.converted.client.id)
    expect(uploaded.body.document.caseId).toBe(converted.converted.clientCase.id)
    expect(uploaded.body.document).not.toHaveProperty('storageKey')
    expect(uploaded.body.document).not.toHaveProperty('storageUrl')

    const documentId = uploaded.body.document.id as string
    expect(objects.size).toBe(1)
    const storedKey = [...objects.keys()][0]
    expect(storedKey).toContain(brokerageAId)
    expect(storedKey).not.toContain('income.pdf')

    const invalidMime = await request(app).post('/api/clients/me/documents')
      .set('Authorization', `Bearer ${converted.clientToken}`)
      .attach('file', Buffer.from('not a supported document'), { filename: 'script.exe', contentType: 'application/x-msdownload' })
      .field('documentType', 'OTHER')
    expect(invalidMime.status).toBe(415)
    const badSignature = await request(app).post('/api/clients/me/documents')
      .set('Authorization', `Bearer ${converted.clientToken}`)
      .attach('file', Buffer.from('not a PDF'), { filename: 'spoof.pdf', contentType: 'application/pdf' })
      .field('documentType', 'OTHER')
    expect(badSignature.status).toBe(415)

    const tooLarge = await request(app).post('/api/clients/me/documents')
      .set('Authorization', `Bearer ${converted.clientToken}`)
      .attach('file', Buffer.alloc(10 * 1024 * 1024 + 1, 65), { filename: 'large.pdf', contentType: 'application/pdf' })
      .field('documentType', 'OTHER')
    expect(tooLarge.status).toBe(413)

    expect((await request(app).get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${existingClientBToken}`)).status).toBe(404)
    expect((await request(app).get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${advisorBToken}`)).status).toBe(404)
    expect((await request(app).get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${advisorAToken}`)).status).toBe(200)
    const download = await request(app).get(`/api/documents/${documentId}/download`).set('Authorization', `Bearer ${converted.clientToken}`)
    expect(download.status).toBe(200)
    expect(download.body.url).toMatch(/^https:\/\/private-storage\.test\//)
    expect((await request(app).patch(`/api/documents/${documentId}`).set('Authorization', `Bearer ${converted.clientToken}`).send({ verificationStatus: 'VERIFIED' })).status).toBe(404)
  })

  it('moves UPLOADED to CHECKING then VERIFIED asynchronously, and permits retry after a simulated failure', async () => {
    const converted = await createCaseFor('A')
    process.env.DOCUMENT_VERIFICATION_DELAY_MS = '250'
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
    const uploaded = await uploadPdf(converted.clientToken, 'id.pdf', { documentType: 'IDENTITY' })
    expect(uploaded.body.document.verificationStatus).toBe('UPLOADED')
    const documentId = uploaded.body.document.id as string

    let workerFinished = false
    const worker = processNextVerificationJob().finally(() => { workerFinished = true })
    let status = 'UPLOADED'
    for (let index = 0; index < 20 && status !== 'CHECKING'; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      status = (await DocumentModel.findById(documentId))?.verificationStatus ?? 'MISSING'
    }
    expect(status).toBe('CHECKING')
    expect(workerFinished).toBe(false)
    await worker
    const verified = await DocumentModel.findById(documentId)
    expect(verified?.verificationStatus).toBe('VERIFIED')
    expect(verified?.verificationAttempts).toBe(1)

    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '100'
    const second = await uploadPdf(converted.clientToken, 'income.pdf', { documentType: 'INCOME' })
    const secondId = second.body.document.id as string
    await processNextVerificationJob()
    expect((await DocumentModel.findById(secondId))?.verificationStatus).toBe('FAILED')

    const retry = await request(app).post(`/api/documents/${secondId}/retry`).set('Authorization', `Bearer ${converted.clientToken}`)
    expect(retry.status).toBe(200)
    expect(retry.body.document.verificationStatus).toBe('UPLOADED')
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
    await processNextVerificationJob()
    const retried = await DocumentModel.findById(secondId)
    expect(retried?.verificationStatus).toBe('VERIFIED')
    expect(retried?.verificationAttempts).toBe(2)
  })

  it('polls the persistent job in the background instead of waiting in the upload request', async () => {
    const converted = await createCaseFor('A')
    process.env.DOCUMENT_VERIFICATION_DELAY_MS = '500'
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
    const stopWorker = startVerificationWorker()
    try {
      const start = Date.now()
      const uploaded = await uploadPdf(converted.clientToken, 'background.pdf', { documentType: 'OTHER' })
      const requestDuration = Date.now() - start
      expect(uploaded.status).toBe(201)
      expect(uploaded.body.document.verificationStatus).toBe('UPLOADED')
      expect(requestDuration).toBeLessThan(500)
      const documentId = uploaded.body.document.id as string

      let status = 'UPLOADED'
      for (let index = 0; index < 30 && status !== 'VERIFIED'; index += 1) {
        await new Promise((resolve) => setTimeout(resolve, 25))
        status = (await DocumentModel.findById(documentId))?.verificationStatus ?? 'MISSING'
      }
      expect(status).toBe('VERIFIED')
    } finally {
      stopWorker()
    }
  })

  it('recovers a job left processing after a simulated worker crash', async () => {
    const converted = await createCaseFor('A')
    process.env.DOCUMENT_VERIFICATION_DELAY_MS = '0'
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
    const uploaded = await uploadPdf(converted.clientToken, 'recovery.pdf', { documentType: 'OTHER' })
    const documentId = uploaded.body.document.id as string
    const job = await VerificationJob.findOne({ documentId })
    expect(job).not.toBeNull()
    await DocumentModel.updateOne({ _id: documentId }, { $set: { verificationStatus: 'CHECKING' } })
    await VerificationJob.updateOne({ _id: job!._id }, { $set: { state: 'PROCESSING', attempts: 1, leaseUntil: new Date(Date.now() - 1000) } })

    expect(await processNextVerificationJob()).toBe(true)
    const recovered = await DocumentModel.findById(documentId)
    expect(recovered?.verificationStatus).toBe('VERIFIED')
  })

  it('does not re-run a terminal document if the worker crashed before completing the job record', async () => {
    const converted = await createCaseFor('A')
    const uploaded = await uploadPdf(converted.clientToken, 'terminal.pdf', { documentType: 'OTHER' })
    const documentId = uploaded.body.document.id as string
    const job = await VerificationJob.findOne({ documentId })
    await DocumentModel.updateOne({ _id: documentId }, { $set: { verificationStatus: 'VERIFIED', verificationAttempts: 1 } })
    await VerificationJob.updateOne({ _id: job!._id }, { $set: { state: 'PROCESSING', attempts: 1, leaseUntil: new Date(Date.now() - 1000) } })

    expect(await processNextVerificationJob()).toBe(true)
    const recovered = await DocumentModel.findById(documentId)
    const completedJob = await VerificationJob.findById(job!._id)
    expect(recovered?.verificationStatus).toBe('VERIFIED')
    expect(recovered?.verificationAttempts).toBe(1)
    expect(completedJob?.state).toBe('COMPLETED')
  })
})

describe('document Socket.IO isolation', () => {
  it('sends client status only to that client and their brokerage staff', async () => {
    process.env.DOCUMENT_VERIFICATION_DELAY_MS = '0'
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '100'
    const caseA = await createCaseFor('A')
    const caseB = await createCaseFor('B')
    const clientA = await connectedSocket(caseA.clientToken)
    const advisorA = await connectedSocket(advisorAToken)
    const clientB = await connectedSocket(caseB.clientToken)
    const advisorB = await connectedSocket(advisorBToken)
    const events = new Map<Socket, unknown[]>([[clientA, []], [advisorA, []], [clientB, []], [advisorB, []]])
    for (const [socket, eventList] of events) socket.on('document:update', (event) => eventList.push(event))

    const uploaded = await uploadPdf(caseA.clientToken, 'socket.pdf', { documentType: 'IDENTITY' })
    expect(uploaded.status).toBe(201)
    const documentId = uploaded.body.document.id as string
    await processNextVerificationJob()
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect((await DocumentModel.findById(documentId))?.verificationStatus).toBe('FAILED')
    const retry = await request(app).post(`/api/documents/${documentId}/retry`).set('Authorization', `Bearer ${caseA.clientToken}`)
    expect(retry.status).toBe(200)
    process.env.DOCUMENT_VERIFICATION_FAILURE_PERCENT = '0'
    await processNextVerificationJob()
    await new Promise((resolve) => setTimeout(resolve, 50))

    const clientAEvents = events.get(clientA) as Array<{ document: { id: string; verificationStatus: string } }>
    const advisorAEvents = events.get(advisorA) as Array<{ document: { id: string; verificationStatus: string } }>
    const clientBEvents = events.get(clientB) as unknown[]
    const advisorBEvents = events.get(advisorB) as unknown[]
    expect(clientAEvents.some((event) => event.document.id === documentId && event.document.verificationStatus === 'UPLOADED')).toBe(true)
    expect(advisorAEvents.some((event) => event.document.id === documentId && event.document.verificationStatus === 'VERIFIED')).toBe(true)
    expect(clientAEvents.some((event) => event.document.id === documentId && event.document.verificationStatus === 'FAILED')).toBe(true)
    expect(clientAEvents.filter((event) => event.document.id === documentId && event.document.verificationStatus === 'UPLOADED')).toHaveLength(2)
    expect(clientBEvents).toHaveLength(0)
    expect(advisorBEvents).toHaveLength(0)

    for (const socket of events.keys()) socket.disconnect()
  })
})