import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import crypto from 'node:crypto'

describe('Tally Webhook Integration', () => {
    let mongo: MongoMemoryServer
    const signingSecret = 'test-signing-secret'

    beforeAll(async () => {
        process.env.TALLY_WEBHOOK_SIGNING_SECRET = signingSecret
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri(), { dbName: 'tally_test' })
    })

    const generateSignature = (payload: any) => {
        const hmac = crypto.createHmac('sha256', signingSecret)
        hmac.update(JSON.stringify(payload))
        return hmac.digest('base64')
    }

    it('should reject invalid signature', async () => {
        const payload = { data: { submission_id: '123' } }
        const response = await request(app)
            .post('/api/tally/leads')
            .set('tally-signature', 'invalid')
            .set('Authorization', 'Bearer test-brokerage-token') // Mock auth
            .send(payload)
        expect(response.status).toBe(401)
    })

    // Additional tests for mapping, required fields, etc.
})
