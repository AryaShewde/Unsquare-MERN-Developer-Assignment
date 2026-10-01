import { Router } from 'express'
import { z } from 'zod'
import type { Request, Response } from 'express'
import { LEAD_STATUSES } from '../models/leadStatus.js'
import {
  listEmailTriggers,
  createEmailTrigger,
  updateEmailTrigger,
  deleteEmailTrigger,
} from '../services/taskAutomationService.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { AppError } from '../utils/AppError.js'

const router = Router()

const createSchema = z.object({
  stage: z.enum(LEAD_STATUSES),
  templateId: z.string(),
  active: z.boolean().optional(),
})

const patchSchema = createSchema.partial().extend({
  templateId: z.string().optional(),
})

function parseOrRespond<T>(schema: z.ZodType<T>, input: unknown, response: Response): T | null {
  const result = schema.safeParse(input)
  if (!result.success) {
    response.status(400).json({ error: result.error.issues[0]?.message ?? 'Invalid request.' })
    return null
  }
  return result.data
}

function getParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string') throw new AppError(400, `Invalid ${name}.`)
  return value
}

export async function listEmailTriggersController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  if (!user.brokerageId && user.role !== 'PLATFORM_ADMIN') {
    throw new AppError(403, 'A brokerage is required.')
  }
  const brokerageId = user.role === 'PLATFORM_ADMIN'
    ? (typeof request.query.brokerageId === 'string' ? request.query.brokerageId : null)
    : user.brokerageId

  if (!brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }
  response.json({ triggers: await listEmailTriggers(brokerageId) })
}

export async function createEmailTriggerController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  if (user.role !== 'BROKERAGE_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
    throw new AppError(403, 'Only Brokerage Admins can configure email triggers.')
  }
  if (!user.brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }

  const input = parseOrRespond(createSchema, request.body, response)
  if (!input) return

  response.status(201).json({ trigger: await createEmailTrigger(user.brokerageId, input) })
}

export async function updateEmailTriggerController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  if (user.role !== 'BROKERAGE_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
    throw new AppError(403, 'Only Brokerage Admins can configure email triggers.')
  }
  if (!user.brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }

  const patch = parseOrRespond(patchSchema, request.body, response)
  if (!patch) return

  response.json({ trigger: await updateEmailTrigger(user.brokerageId, getParam(request.params.triggerId, 'trigger ID'), patch) })
}

export async function deleteEmailTriggerController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  if (user.role !== 'BROKERAGE_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
    throw new AppError(403, 'Only Brokerage Admins can configure email triggers.')
  }
  if (!user.brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }

  await deleteEmailTrigger(user.brokerageId, getParam(request.params.triggerId, 'trigger ID'))
  response.status(204).end()
}

import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

router.use(requireAuth, requireRole(ROLES.BROKERAGE_ADMIN, ROLES.PLATFORM_ADMIN))
router.get('/', listEmailTriggersController)
router.post('/', createEmailTriggerController)
router.patch('/:triggerId', updateEmailTriggerController)
router.delete('/:triggerId', deleteEmailTriggerController)

export const emailTriggerRouter = router