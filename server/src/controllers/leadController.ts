import type { Request, Response } from 'express'
import { z } from 'zod'
import { LEAD_STATUSES } from '../models/leadStatus.js'
import {
  assignLead,
  changeLeadStatus,
  createLead,
  deleteLead,
  getLead,
  listLeadAdvisors,
  listLeadBrokerages,
  listLeads,
  updateLead,
  getLeadSummary,
} from '../services/leadService.js'
import type { LeadStatus } from '../models/leadStatus.js'
import { AppError } from '../utils/AppError.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'

const createSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).refine((phone) => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15
  }, 'Enter a valid phone number.'),
  source: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(5000).optional(),
  brokerageId: z.string().optional(),
})

const patchSchema = createSchema.omit({ brokerageId: true }).partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.')
const statusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  expectedUpdatedAt: z.string().datetime(),
})
const assignmentSchema = z.object({ assignedAdvisorId: z.string().nullable() })
const webhookSchema = createSchema.omit({ brokerageId: true }).extend({ eventId: z.string().trim().min(1).max(250).optional() })

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

export async function createLeadController(request: Request, response: Response): Promise<void> {
  const input = parseOrRespond(createSchema, request.body, response)
  if (!input) return
  const result = await createLead(request.user!, input)
  response.status(201).json({ lead: result.lead })
}

export async function getLeadSummaryController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  if (!user.brokerageId && user.role !== 'PLATFORM_ADMIN') {
    throw new AppError(403, 'A brokerage is required.')
  }
  const brokerageId = user.role === 'PLATFORM_ADMIN'
    ? (typeof request.query.brokerageId === 'string' ? request.query.brokerageId : null)
    : user.brokerageId

  response.json(await getLeadSummary(brokerageId))
}

export async function listLeadsController(request: Request, response: Response): Promise<void> {
  const statusQuery = request.query.status
  let status: LeadStatus | undefined
  if (statusQuery !== undefined) {
    const parsedStatus = z.enum(LEAD_STATUSES).safeParse(statusQuery)
    if (!parsedStatus.success) {
      response.status(400).json({ error: 'Invalid pipeline status.' })
      return
    }
    status = parsedStatus.data
  }
  const brokerageId = typeof request.query.brokerageId === 'string' ? request.query.brokerageId : undefined
  response.json({ leads: await listLeads(request.user!, brokerageId, status) })
}

export async function getLeadController(request: Request, response: Response): Promise<void> {
  response.json({ lead: await getLead(request.user!, getParam(request.params.leadId, 'lead ID')) })
}

export async function updateLeadController(request: Request, response: Response): Promise<void> {
  const patch = parseOrRespond(patchSchema, request.body, response)
  if (!patch) return
  response.json({ lead: await updateLead(request.user!, getParam(request.params.leadId, 'lead ID'), patch) })
}

export async function changeLeadStatusController(request: Request, response: Response): Promise<void> {
  const input = parseOrRespond(statusSchema, request.body, response)
  if (!input) return
  response.json({
    lead: await changeLeadStatus(
      request.user!,
      getParam(request.params.leadId, 'lead ID'),
      input.status,
      input.expectedUpdatedAt,
    ),
  })
}

export async function assignLeadController(request: Request, response: Response): Promise<void> {
  const input = parseOrRespond(assignmentSchema, request.body, response)
  if (!input) return
  response.json({ lead: await assignLead(request.user!, getParam(request.params.leadId, 'lead ID'), input.assignedAdvisorId) })
}

export async function deleteLeadController(request: Request, response: Response): Promise<void> {
  await deleteLead(request.user!, getParam(request.params.leadId, 'lead ID'))
  response.status(204).end()
}

export async function listLeadAdvisorsController(request: Request, response: Response): Promise<void> {
  const brokerageId = typeof request.query.brokerageId === 'string' ? request.query.brokerageId : undefined
  response.json({ advisors: await listLeadAdvisors(request.user!, brokerageId) })
}

export async function listLeadBrokeragesController(request: Request, response: Response): Promise<void> {
  response.json({ brokerages: await listLeadBrokerages(request.user!) })
}

export async function createWebhookLeadController(request: Request, response: Response): Promise<void> {
  const input = parseOrRespond(webhookSchema, request.body, response)
  if (!input) return
  if (!request.webhookBrokerageId) throw new AppError(401, 'Webhook credential required.')
  const { eventId, ...leadInput } = input
  const result = await import('../services/leadService.js').then(({ createWebhookLead }) =>
    createWebhookLead(request.webhookBrokerageId!, leadInput, eventId))
  response.status(result.duplicateEvent ? 200 : 201).json({
    lead: result.lead,
    ...(result.duplicateEvent ? { duplicateEvent: true } : {}),
  })
}