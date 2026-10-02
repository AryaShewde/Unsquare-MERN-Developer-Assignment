import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Cron Verification Integration', () => {
    let mongo: MongoMemoryServer
    const cronSecret = 'test-cron-secret'

    beforeAll(async () => {
        process.env.CRON_SECRET = cronSecret
        mongo = await MongoMemoryServer.create()
        await mongoose.connect(mongo.getUri(), { dbName: 'cron_test' })
    })

    it('should reject requests without authorization', async () => {
        const response = await request(app).post('/api/cron/verify')
        expect(response.status).toBe(401)
    })

    it('should reject requests with invalid authorization', async () => {
        const response = await request(app)
            .post('/api/cron/verify')
            .set('Authorization', 'Bearer invalid-token')
        expect(response.status).toBe(401)
    })

    it('should accept requests with valid authorization', async () => {
        const response = await request(app)
            .post('/api/cron/verify')
            .set('Authorization', `Bearer ${cronSecret}`)
        expect(response.status).toBe(200)
    })
})
