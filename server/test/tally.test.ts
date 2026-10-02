import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import crypto from 'node:crypto'
import { Brokerage } from '../src/models/Brokerage.js'
import { vi } from 'vitest'

vi.mock('../src/services/webhookSecretService.js', () => ({
    findWebhookBrokerageId: vi.fn().mockImplementation((token) => {
        if (token === 'valid-test-token') return '6abaf25984890b179a7c98a2'
        return null
    })
}))

describe('Tally Webhook Integration', () => {
    let mongo: MongoMemoryServer
    let brokerageId: string
    const signingSecret = 'test-signing-secret'

    beforeAll(async () => {
        process.env.TALLY_WEBHOOK_SIGNING_SECRET = signingSecret
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri(), { dbName: 'tally_test' })
        const brokerage = await Brokerage.create({ name: 'Tally Test' })
        brokerageId = brokerage.id
    })

    const generateSignature = (payload: any) => {
        const hmac = crypto.createHmac('sha256', signingSecret)
        hmac.update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        return hmac.digest('base64')
    }

    it('should reject invalid signature', async () => {
        const payload = { data: { submission_id: '123' } }
        const payloadString = JSON.stringify(payload)
        const response = await request(app)
            .post('/api/tally/leads')
            .set('tally-signature', 'invalid')
            .set('Authorization', 'Bearer test-brokerage-token') // Mock auth
            .set('Content-Type', 'application/json')
            .send(payloadString)
        expect(response.status).toBe(401)
    })

    it('should process a valid external lead with robust field mapping', async () => {
        // Realistic mapping configuration
        process.env.TALLY_FIRST_NAME_REF = 'question_OBZW1Y'
        process.env.TALLY_LAST_NAME_REF = 'question_V1akEM'
        process.env.TALLY_EMAIL_REF = 'question_PBNajB'
        process.env.TALLY_PHONE_REF = 'question_EbG4zB'

        const payload = {
            data: {
                submission_id: 'tf-real-12345',
                fields: [
                    { field: { key: 'question_OBZW1Y' }, type: 'text', value: 'Test' },
                    { field: { key: 'question_V1akEM' }, type: 'text', value: 'Lead' },
                    { field: { key: 'question_PBNajB' }, type: 'email', value: 'testlead@gmail.com' },
                    { field: { key: 'question_EbG4zB' }, type: 'phone_number', value: '+917715838869' }
                ]
            }
        }
        
        const payloadString = JSON.stringify(payload)
        const signature = generateSignature(payloadString)

        const response = await request(app)
            .post('/api/tally/leads')
            .set('tally-signature', signature)
            .set('Authorization', 'Bearer valid-test-token')
            .set('Content-Type', 'application/json')
            .send(payloadString)
            
        // Validate result
        expect(response.status).toBe(201)
        expect(response.body.lead.firstName).toBe('Test')
        expect(response.body.lead.lastName).toBe('Lead')
        expect(response.body.lead.email).toBe('testlead@gmail.com')
        expect(response.body.lead.phone).toBe('+917715838869')
    })
})
