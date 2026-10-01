import { Router } from 'express'
import { getClientCasesController, getMyCasesController, listClientsController, listMyDocumentsController } from '../controllers/clientCaseController.js'
import { uploadClientDocumentController } from '../controllers/documentController.js'
import { documentUpload } from '../middleware/documentUpload.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

export const clientRouter = Router()
const clientManagers = [ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR] as const

clientRouter.use(requireAuth)
clientRouter.get('/me/cases', requireRole(ROLES.CLIENT), getMyCasesController)
clientRouter.get('/me/documents', requireRole(ROLES.CLIENT), listMyDocumentsController)
clientRouter.post('/me/documents', requireRole(ROLES.CLIENT), documentUpload.single('file'), uploadClientDocumentController)
clientRouter.get('/', requireRole(...clientManagers), listClientsController)
clientRouter.get('/:clientId/cases', requireRole(...clientManagers), getClientCasesController)