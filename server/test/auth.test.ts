import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../src/app.js'
import { Brokerage } from '../src/models/Brokerage.js'
import { ROLES, type UserRole } from '../src/models/roles.js'
import { User } from '../src/models/User.js'
import { hashPassword } from '../src/services/passwordService.js'
import { assertBrokerageAccess, assertClientRecordAccess } from '../src/utils/tenantAccess.js'
import type { AuthenticatedUser } from '../src/middleware/requestUser.js'

const password = 'DemoPassword!2026'
let mongo: MongoMemoryServer
let brokerageAId: string
let brokerageBId: string
const userIds = new Map<string, string>()

const accounts: Array<{ email: string; name: string; role: UserRole; brokerage: 'A' | 'B' | null }> = [
  { email: 'platform@test.local', name: 'Platform Test', role: ROLES.PLATFORM_ADMIN, brokerage: null },
  { email: 'admin.a@test.local', name: 'Admin A', role: ROLES.BROKERAGE_ADMIN, brokerage: 'A' },
  { email: 'advisor.a@test.local', name: 'Advisor A', role: ROLES.ADVISOR, brokerage: 'A' },
  { email: 'client.a@test.local', name: 'Client A', role: ROLES.CLIENT, brokerage: 'A' },
  { email: 'admin.b@test.local', name: 'Admin B', role: ROLES.BROKERAGE_ADMIN, brokerage: 'B' },
  { email: 'advisor.b@test.local', name: 'Advisor B', role: ROLES.ADVISOR, brokerage: 'B' },
  { email: 'client.b@test.local', name: 'Client B', role: ROLES.CLIENT, brokerage: 'B' },
]

beforeAll(async () => {
  process.env.JWT_SECRET = 'phase-two-test-secret-that-is-at-least-32-characters'
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri(), { dbName: 'leadflow_phase_two_test' })
  await Promise.all([Brokerage.init(), User.init()])

  const [brokerageA, brokerageB] = await Brokerage.create([
    { name: 'Test Brokerage A' },
    { name: 'Test Brokerage B' },
  ])
  brokerageAId = brokerageA.id
  brokerageBId = brokerageB.id
  const passwordHash = await hashPassword(password)

  for (const account of accounts) {
    const brokerageId = account.brokerage === 'A'
      ? brokerageA._id
      : account.brokerage === 'B' ? brokerageB._id : null
    const user = await User.create({ ...account, passwordHash, brokerageId })
    userIds.set(account.email, user.id)
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

async function loginAs(email: string) {
  const response = await request(app).post('/api/auth/login').send({ email, password })
  expect(response.status).toBe(200)
  return response.body as { token: string; user: Record<string, unknown> }
}

describe('authentication', () => {
  it.each(accounts)('allows $role to log in with safe profile data', async ({ email, role, brokerage }) => {
    const result = await loginAs(email)
    expect(result.token).toEqual(expect.any(String))
    expect(result.user.role).toBe(role)
    expect(result.user.brokerageName).toBe(brokerage === 'A' ? 'Test Brokerage A' : brokerage === 'B' ? 'Test Brokerage B' : null)
    expect(result.user).not.toHaveProperty('password')
    expect(result.user).not.toHaveProperty('passwordHash')
  })

  it('rejects an invalid password and unknown user without revealing which failed', async () => {
    const invalidPassword = await request(app).post('/api/auth/login')
      .send({ email: 'admin.a@test.local', password: 'incorrect' })
    const unknownUser = await request(app).post('/api/auth/login')
      .send({ email: 'missing@test.local', password })
    expect(invalidPassword.status).toBe(401)
    expect(unknownUser.status).toBe(401)
    expect(invalidPassword.body.error).toBe(unknownUser.body.error)
  })

  it('validates required email and password fields', async () => {
    expect((await request(app).post('/api/auth/login').send({ password })).status).toBe(400)
    expect((await request(app).post('/api/auth/login').send({ email: 'bad-email', password })).status).toBe(400)
    expect((await request(app).post('/api/auth/login').send({ email: 'valid@test.local' })).status).toBe(400)
  })

  it('requires a valid JWT for /me and returns only the current safe profile', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401)

    const { token } = await loginAs('admin.a@test.local')
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('admin.a@test.local')
    expect(response.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects invalid and expired JWTs', async () => {
    const invalid = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt')
    const jwt = await import('jsonwebtoken')
    const expired = jwt.default.sign(
      { sub: userIds.get('admin.a@test.local') },
      process.env.JWT_SECRET!,
      { expiresIn: -1 },
    )
    expect(invalid.status).toBe(401)
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`)).status).toBe(401)
  })
})

describe('authorization and tenant isolation', () => {
  it('limits Brokerage Admin user management to its own brokerage', async () => {
    const { token } = await loginAs('admin.a@test.local')
    const list = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.users.every((user: { brokerageId: string }) => user.brokerageId === brokerageAId)).toBe(true)

    const otherBrokerageUser = await request(app).get(`/api/users/${userIds.get('admin.b@test.local')}`)
      .set('Authorization', `Bearer ${token}`)
    expect(otherBrokerageUser.status).toBe(403)

    const attemptedReassignment = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cross Tenant', email: 'cross@test.local', password, role: ROLES.ADVISOR, brokerageId: brokerageBId })
    expect(attemptedReassignment.status).toBe(403)
  })

  it('denies Advisor user administration and rejects cross-brokerage access in the shared helper', async () => {
    const { token } = await loginAs('advisor.a@test.local')
    expect((await request(app).get('/api/users').set('Authorization', `Bearer ${token}`)).status).toBe(403)

    const advisor: AuthenticatedUser = {
      id: userIds.get('advisor.a@test.local')!,
      name: 'Advisor A',
      email: 'advisor.a@test.local',
      role: ROLES.ADVISOR,
      brokerageId: brokerageAId,
    }
    expect(() => assertBrokerageAccess(advisor, brokerageBId)).toThrow('not allowed')
    expect(() => assertBrokerageAccess(advisor, brokerageAId)).not.toThrow()
  })

  it('lets Clients access only their own client records', () => {
    const client: AuthenticatedUser = {
      id: userIds.get('client.a@test.local')!,
      name: 'Client A',
      email: 'client.a@test.local',
      role: ROLES.CLIENT,
      brokerageId: brokerageAId,
    }
    expect(() => assertClientRecordAccess(client, brokerageAId, client.id)).not.toThrow()
    expect(() => assertClientRecordAccess(client, brokerageAId, userIds.get('client.b@test.local')!)).toThrow('own records')
    expect(() => assertClientRecordAccess(client, brokerageBId, userIds.get('client.b@test.local')!)).toThrow('not allowed')
  })

  it('prevents normal users from creating Platform Admin accounts', async () => {
    const { token } = await loginAs('admin.a@test.local')
    const response = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Escalated', email: 'escalated@test.local', password, role: ROLES.PLATFORM_ADMIN })
    expect(response.status).toBe(403)

    const advisorLogin = await loginAs('advisor.a@test.local')
    expect((await request(app).post('/api/users').set('Authorization', `Bearer ${advisorLogin.token}`)
      .send({ name: 'Unauthorized', email: 'unauthorized@test.local', password, role: ROLES.ADVISOR, brokerageId: brokerageAId })).status).toBe(403)
  })

  it('creates users with hashed passwords and rejects duplicate emails or invalid brokerages', async () => {
    const { token: adminToken } = await loginAs('admin.a@test.local')
    const created = await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Advisor', email: 'new.advisor@test.local', password, role: ROLES.ADVISOR })
    expect(created.status).toBe(201)
    expect(created.body.user.role).toBe(ROLES.ADVISOR)
    expect(created.body.user.brokerageId).toBe(brokerageAId)
    expect(created.body.user).not.toHaveProperty('passwordHash')

    const duplicate = await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Duplicate', email: 'admin.a@test.local', password, role: ROLES.ADVISOR })
    expect(duplicate.status).toBe(409)

    const { token: platformToken } = await loginAs('platform@test.local')
    const invalidBrokerage = await request(app).post('/api/users').set('Authorization', `Bearer ${platformToken}`)
      .send({ name: 'Invalid Tenant', email: 'invalid.tenant@test.local', password, role: ROLES.ADVISOR, brokerageId: 'not-an-object-id' })
    expect(invalidBrokerage.status).toBe(400)
  })

  it('keeps Platform Admin brokerage-independent and allows platform-wide user listing', async () => {
    const { token, user } = await loginAs('platform@test.local')
    expect(user.brokerageId).toBeNull()
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body.users).toHaveLength(accounts.length + 1)
  })
})