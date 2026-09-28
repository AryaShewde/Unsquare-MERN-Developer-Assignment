import { Router } from 'express'
import { loginController, meController } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const authRouter = Router()

authRouter.post('/login', loginController)
authRouter.get('/me', requireAuth, meController)