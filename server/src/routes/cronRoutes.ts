import { Router } from 'express'
import verifyEndpoint from '../../api/cron/verify.js'

export const cronRouter = Router()

cronRouter.post('/verify', verifyEndpoint)
