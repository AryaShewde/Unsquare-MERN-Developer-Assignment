import { Router } from 'express'
import {
  assignLeadController,
  changeLeadStatusController,
  createLeadController,
  deleteLeadController,
  getLeadController,
  listLeadAdvisorsController,
  listLeadBrokeragesController,
  listLeadsController,
  updateLeadController,
} from '../controllers/leadController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'
import { convertLeadController } from '../controllers/conversionController.js'

export const leadRouter = Router()
const leadManagers = [ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR] as const

leadRouter.use(requireAuth, requireRole(...leadManagers))
leadRouter.get('/advisors', listLeadAdvisorsController)
leadRouter.get('/brokerages', listLeadBrokeragesController)
leadRouter.get('/', listLeadsController)
leadRouter.post('/', createLeadController)
leadRouter.get('/:leadId', getLeadController)
leadRouter.patch('/:leadId', updateLeadController)
leadRouter.patch('/:leadId/status', changeLeadStatusController)
leadRouter.patch('/:leadId/assignment', assignLeadController)
leadRouter.post('/:leadId/convert', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR), convertLeadController)
leadRouter.delete('/:leadId', requireRole(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN), deleteLeadController)