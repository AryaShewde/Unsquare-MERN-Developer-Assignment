import { it, expect, describe, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../src/app.js'
import { LEAD_STATUSES } from '../src/models/leadStatus.js'
import { User } from '../src/models/User.js'
import { ROLES } from '../src/models/roles.js'
import { Brokerage } from '../src/models/Brokerage.js'
import { Lead } from '../src/models/Lead.js'
import { EmailTemplate } from '../src/models/EmailTemplate.js'
import { EmailLog } from '../src/models/EmailLog.js'
import { StageEmailTrigger } from '../src/models/StageEmailTrigger.js'
import { Task } from '../src/models/Task.js'
import { TaskTrigger } from '../src/models/TaskTrigger.js'
import { hashPassword } from '../src/services/passwordService.js'

// Mock email service
import * as emailService from '../src/services/emailService.js'
import { vi } from 'vitest'

vi.mock('../src/services/emailService.js', async () => {
  const actual = await vi.importActual('../src/services/emailService.js')
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'mock-id' })
  }
})

describe('Phase 5: Automation Features', () => {
  let mongo: MongoMemoryServer
  let platformToken: string
  let adminAToken: string
  let advisorAToken: string
  let brokerageAId: string
  let brokerageBId: string
  let testLeadId: string
  let advisorAId: string
  const password = 'PhaseFiveTest!2026'

  beforeAll(async () => {
    process.env.JWT_SECRET = 'phase-five-test-secret-at-least-thirty-two-characters'
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri(), { dbName: 'leadflow_phase_five_test' })
    await Promise.all([
      Brokerage.init(),
      User.init(),
      Lead.init(),
      EmailTemplate.init(),
      EmailLog.init(),
      StageEmailTrigger.init(),
      Task.init(),
      TaskTrigger.init()
    ])

    const [brokerageA, brokerageB] = await Brokerage.create([
      { name: 'Phase Five Brokerage A' },
      { name: 'Phase Five Brokerage B' },
    ])
    brokerageAId = brokerageA.id
    brokerageBId = brokerageB.id

    const passwordHash = await hashPassword(password)

    // Setup Platform Admin
    await User.create({
      name: 'Platform Admin',
      email: 'platform@phase5.test',
      passwordHash,
      role: ROLES.PLATFORM_ADMIN,
      brokerageId: null
    })

    // Setup Brokerage Admin A
    await User.create({
      name: 'Brokerage Admin A',
      email: 'admin.a@phase5.test',
      passwordHash,
      role: ROLES.BROKERAGE_ADMIN,
      brokerageId: brokerageA._id
    })

    // Setup Advisor A
    const advisorA = await User.create({
      name: 'Advisor A',
      email: 'advisor.a@phase5.test',
      passwordHash,
      role: ROLES.ADVISOR,
      brokerageId: brokerageA._id
    })
    advisorAId = advisorA.id

    const login = async (email: string) => {
      const response = await request(app).post('/api/auth/login').send({ email, password })
      if (response.status !== 200) throw new Error(`Could not prepare ${email} for the integration test.`)
      return response.body as { token: string }
    }

    const tokens = await Promise.all([
      login('platform@phase5.test'),
      login('admin.a@phase5.test'),
      login('advisor.a@phase5.test')
    ])

    platformToken = tokens[0].token
    adminAToken = tokens[1].token
    advisorAToken = tokens[2].token

    // Create test lead in brokerage A
    const lead = await Lead.create({
      brokerageId: brokerageA._id,
      firstName: 'Test',
      lastName: 'Lead',
      email: 'test@lead.com',
      phone: '+1234567890',
      emailNormalized: 'test@lead.com',
      phoneNormalized: '+1234567890',
      source: 'Web Form',
      status: 'NEW'
    })
    testLeadId = lead.id
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  describe('Email Templates', () => {
    it('allows Brokerage Admin to create email templates', async () => {
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${adminAToken}`)
        .send({
          name: 'Welcome Template',
          subject: 'Welcome {{clientName}}!',
          body: 'Hello {{clientName}}, welcome to our service.',
          active: true
        })

      expect(response.status).toBe(201)
      expect(response.body.template).toHaveProperty('id')
      expect(response.body.template.name).toBe('Welcome Template')
      expect(response.body.template.subject).toBe('Welcome {{clientName}}!')
    })

    it('prevents non-admin users from creating email templates', async () => {
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${advisorAToken}`)
        .send({
          name: 'Unauthorized Template',
          subject: 'Test',
          body: 'Test',
          active: true
        })

      expect(response.status).toBe(403)
    })

    it('allows listing email templates for a brokerage', async () => {
      const response = await request(app)
        .get(`/api/email-templates`)
        .set('Authorization', `Bearer ${advisorAToken}`)

      expect(response.status).toBe(200)
      expect(response.body.templates.length).toBeGreaterThan(0)
    })

    it('enforces brokerage isolation for email templates', async () => {
      // Platform admin can see templates from a specific brokerage
      const response = await request(app)
        .get(`/api/email-templates?brokerageId=${brokerageBId}`)
        .set('Authorization', `Bearer ${platformToken}`)

      expect(response.status).toBe(200)
      expect(response.body.templates).toHaveLength(0) // No templates in B yet
    })
  })

  describe('Email Triggers', () => {
    let templateId: string

    beforeAll(async () => {
      const template = await EmailTemplate.create({
        brokerageId: brokerageAId,
        name: 'Stage Notification',
        subject: 'Lead moved to {{stage}}',
        body: 'Your lead has been moved to {{stage}} stage.',
        active: true
      })
      templateId = template.id
    })

    it('allows Brokerage Admin to create email triggers', async () => {
      const response = await request(app)
        .post('/api/email-triggers')
        .set('Authorization', `Bearer ${adminAToken}`)
        .send({
          stage: 'QUALIFIED',
          templateId: templateId,
          active: true
        })

      expect(response.status).toBe(201)
      expect(response.body.trigger).toHaveProperty('id')
      expect(response.body.trigger.stage).toBe('QUALIFIED')
    })

    it('prevents creating triggers with invalid stages', async () => {
      const response = await request(app)
        .post('/api/email-triggers')
        .set('Authorization', `Bearer ${adminAToken}`)
        .send({
          stage: 'INVALID_STAGE',
          templateId: templateId,
          active: true
        })

      expect(response.status).toBe(400)
    })
  })

  describe('Task Triggers', () => {
    it('allows Brokerage Admin to create task triggers', async () => {
      const response = await request(app)
        .post('/api/task-triggers')
        .set('Authorization', `Bearer ${adminAToken}`)
        .send({
          stage: 'APPLICATION',
          title: 'Review Application',
          description: 'Review the mortgage application documents',
          dueDays: 3,
          active: true
        })

      expect(response.status).toBe(201)
      expect(response.body.trigger).toHaveProperty('id')
      expect(response.body.trigger.stage).toBe('APPLICATION')
      expect(response.body.trigger.title).toBe('Review Application')
    })
  })

  describe('Task Management', () => {
    it('allows Advisor to create manual tasks', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${advisorAToken}`)
        .send({
          leadId: testLeadId,
          title: 'Follow up with lead',
          description: 'Call the lead',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          assignedAdvisorId: advisorAId
        })

      expect(response.status).toBe(201)
      expect(response.body.task.title).toBe('Follow up with lead')
      expect(response.body.task.source).toBe('MANUAL')
    })

    it('allows Advisor to complete tasks', async () => {
      const task = await Task.create({
        brokerageId: brokerageAId,
        leadId: testLeadId,
        assignedAdvisorId: advisorAId,
        title: 'Complete me',
        dueDate: new Date(),
        status: 'OPEN'
      })

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${advisorAToken}`)
        .send({ status: 'COMPLETED' })

      expect(response.status).toBe(200)
      expect(response.body.task.status).toBe('COMPLETED')
      expect(response.body.task.completedAt).toBeTruthy()
    })
  })

  describe('Automation Execution', () => {
    it('triggers email and task when lead status changes', async () => {
      // Ensure trigger exists for QUALIFIED
      const template = await EmailTemplate.create({
        brokerageId: brokerageAId,
        name: 'Automation Template',
        subject: 'Qualified!',
        body: 'You are qualified, {{clientName}}',
        active: true
      })

      await StageEmailTrigger.create({
        brokerageId: brokerageAId,
        stage: 'QUALIFIED',
        templateId: template._id,
        active: true
      })

      await TaskTrigger.create({
        brokerageId: brokerageAId,
        stage: 'QUALIFIED',
        title: 'Automation Task',
        dueDays: 1,
        active: true
      })

      // Assign advisor to the test lead
      await Lead.findByIdAndUpdate(testLeadId, { assignedAdvisorId: advisorAId })
      const lead = await Lead.findById(testLeadId)

      // Trigger status change
      const response = await request(app)
        .patch(`/api/leads/${testLeadId}/status`)
        .set('Authorization', `Bearer ${advisorAToken}`)
        .send({
          status: 'QUALIFIED',
          expectedUpdatedAt: lead!.updatedAt.toISOString()
        })

      expect(response.status).toBe(200)

      // Wait a bit for async automation
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check email log
      const logs = await EmailLog.find({ leadId: testLeadId, triggerStage: 'QUALIFIED' })
      expect(logs).toHaveLength(1)
      expect(logs[0].status).toBe('SENT')

      // Check task
      const tasks = await Task.find({ leadId: testLeadId, triggerStage: 'QUALIFIED' })
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Automation Task')
      expect(tasks[0].source).toBe('STAGE_TRIGGER')
    })
  })
})
