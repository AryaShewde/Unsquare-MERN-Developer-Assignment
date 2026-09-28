import { Router } from 'express'
import { createUser, getManagedUser, listUsers } from '../controllers/userController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

export const userRouter = Router()
const userManagers = [ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN] as const

userRouter.use(requireAuth, requireRole(...userManagers))
userRouter.get('/', listUsers)
userRouter.post('/', createUser)
userRouter.get('/:userId', getManagedUser)