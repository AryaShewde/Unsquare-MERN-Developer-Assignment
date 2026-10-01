import { Router } from 'express'
import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  listEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../services/emailTemplateService.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { AppError } from '../utils/AppError.js'

const router = Router()

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  active: z.boolean().optional(),
  brokerageId: z.string().optional(),
})

const patchSchema = createSchema.omit({ brokerageId: true }).partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.')

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

export async function listEmailTemplatesController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const brokerageId = typeof request.query.brokerageId === 'string' ? request.query.brokerageId : undefined
  response.json({ templates: await listEmailTemplates(user, brokerageId) })
}

export async function getEmailTemplateController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  response.json({ template: await getEmailTemplate(user, getParam(request.params.templateId, 'template ID')) })
}

export async function createEmailTemplateController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const input = parseOrRespond(createSchema, request.body, response)
  if (!input) return
  response.status(201).json({ template: await createEmailTemplate(user, input) })
}

export async function updateEmailTemplateController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const patch = parseOrRespond(patchSchema, request.body, response)
  if (!patch) return
  response.json({ template: await updateEmailTemplate(user, getParam(request.params.templateId, 'template ID'), patch) })
}

export async function deleteEmailTemplateController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  await deleteEmailTemplate(user, getParam(request.params.templateId, 'template ID'))
  response.status(204).end()
}

import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

router.use(requireAuth)
router.get('/', listEmailTemplatesController)
router.get('/:templateId', getEmailTemplateController)
router.post('/', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.PLATFORM_ADMIN), createEmailTemplateController)
router.patch('/:templateId', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.PLATFORM_ADMIN), updateEmailTemplateController)
router.delete('/:templateId', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.PLATFORM_ADMIN), deleteEmailTemplateController)

export const emailTemplateRouter = router