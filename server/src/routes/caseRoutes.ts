import { Router } from 'express'
import { getCaseController, listCaseDocumentsController } from '../controllers/clientCaseController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

export const caseRouter = Router()

caseRouter.use(requireAuth, requireRole(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR, ROLES.CLIENT))
caseRouter.get('/:caseId', getCaseController)
caseRouter.get('/:caseId/documents', listCaseDocumentsController)