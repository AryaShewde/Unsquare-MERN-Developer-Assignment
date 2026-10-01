import { Router } from 'express'
import { getDocumentController, getDocumentDownloadController, retryDocumentController } from '../controllers/documentController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

export const documentRouter = Router()

documentRouter.use(requireAuth, requireRole(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR, ROLES.CLIENT))
documentRouter.get('/:documentId', getDocumentController)
documentRouter.get('/:documentId/download', getDocumentDownloadController)
documentRouter.post('/:documentId/retry', retryDocumentController)