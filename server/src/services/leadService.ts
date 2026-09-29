import { Types, type FilterQuery } from 'mongoose'
import { Brokerage } from '../models/Brokerage.js'
import { Lead, type LeadDocument } from '../models/Lead.js'
import { LEAD_STATUSES, type LeadStatus } from '../models/leadStatus.js'
import { ROLES } from '../models/roles.js'
import { User } from '../models/User.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { AppError } from '../utils/AppError.js'
import { DuplicateLeadError } from '../utils/DuplicateLeadError.js'
import { normalizeEmail, normalizePhone } from './leadNormalization.js'
import type { LeadSummary } from './leadTypes.js'

export interface LeadInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  source: string
  notes?: string
  brokerageId?: string
}

export interface LeadPatch {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  source?: string
  notes?: string
}

export interface LeadRealtimeEvent {
  action: 'created' | 'updated' | 'assigned' | 'status' | 'deleted'
  brokerageId: string
  leadId: string
  lead: LeadSummary | null
}

let realtimePublisher: ((event: LeadRealtimeEvent) => void) | null = null

export function setLeadRealtimePublisher(publisher: ((event: LeadRealtimeEvent) => void) | null): void {
  realtimePublisher = publisher
}

function publish(action: LeadRealtimeEvent['action'], brokerageId: string, leadId: string, lead: LeadSummary | null): void {
  realtimePublisher?.({ action, brokerageId, leadId, lead })
}

export function serializeLead(lead: LeadDocument): LeadSummary {
  const raw = lead.toObject() as unknown as Record<string, unknown>
  const advisor = raw.assignedAdvisorId && typeof raw.assignedAdvisorId === 'object'
    ? raw.assignedAdvisorId as Record<string, unknown>
    : null
  const advisorId = advisor ? advisor._id : raw.assignedAdvisorId
  return {
    id: String(raw._id),
    brokerageId: String(raw.brokerageId),
    firstName: String(raw.firstName),
    lastName: String(raw.lastName),
    email: String(raw.email),
    phone: String(raw.phone),
    source: String(raw.source),
    status: raw.status as LeadStatus,
    assignedAdvisorId: advisorId ? String(advisorId) : null,
    assignedAdvisorName: advisor && typeof advisor.name === 'string' ? advisor.name : null,
    ...(typeof raw.notes === 'string' ? { notes: raw.notes } : {}),
    createdAt: new Date(raw.createdAt as string | Date).toISOString(),
    updatedAt: new Date(raw.updatedAt as string | Date).toISOString(),
  }
}

async function ensureBrokerageExists(brokerageId: string): Promise<void> {
  if (!Types.ObjectId.isValid(brokerageId) || !(await Brokerage.exists({ _id: brokerageId }))) {
    throw new AppError(400, 'The selected brokerage is invalid.')
  }
}

export async function resolveLeadBrokerage(user: AuthenticatedUser, requestedId?: string): Promise<string> {
  if (user.role === ROLES.PLATFORM_ADMIN) {
    if (!requestedId) throw new AppError(400, 'brokerageId is required for Platform Admin lead creation.')
    await ensureBrokerageExists(requestedId)
    return requestedId
  }
  if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to manage leads.')
  if (requestedId && requestedId.toLowerCase() !== user.brokerageId.toLowerCase()) {
    throw new AppError(403, 'You cannot create a lead for another brokerage.')
  }
  return user.brokerageId
}

export async function resolveLeadListFilter(
  user: AuthenticatedUser,
  requestedId?: string,
): Promise<FilterQuery<LeadDocument>> {
  if (user.role === ROLES.PLATFORM_ADMIN) {
    if (requestedId) {
      await ensureBrokerageExists(requestedId)
      return { brokerageId: requestedId }
    }
    return {}
  }
  if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to manage leads.')
  if (requestedId && requestedId.toLowerCase() !== user.brokerageId.toLowerCase()) {
    throw new AppError(403, 'You cannot access another brokerage.')
  }
  return { brokerageId: user.brokerageId }
}

async function findExistingDuplicate(
  brokerageId: string,
  email: string,
  phone: string,
  exceptId?: string,
): Promise<LeadDocument | null> {
  const filter: FilterQuery<LeadDocument> = {
     brokerageId,
     $or: [{ emailNormalized: normalizeEmail(email) }, { phoneNormalized: normalizePhone(phone) }]
  }
  if (exceptId) filter._id = { $ne: new Types.ObjectId(exceptId) }
  return Lead.findOne(filter).populate('assignedAdvisorId', 'name email')
}

async function throwDuplicateIfFound(brokerageId: string, email: string, phone: string, exceptId?: string): Promise<void> {
  const existing = await findExistingDuplicate(brokerageId, email, phone, exceptId)
  if (existing) throw new DuplicateLeadError(serializeLead(existing))
}

async function handleUniqueConflict(brokerageId: string, email: string, phone: string): Promise<never> {
  const existing = await findExistingDuplicate(brokerageId, email, phone)
  if (existing) throw new DuplicateLeadError(serializeLead(existing))
  throw new AppError(409, 'A conflicting lead request was received. Please retry.')
}

async function createLeadRecord(brokerageId: string, input: LeadInput, sourceEventId?: string) {
  const normalizedEmail = normalizeEmail(input.email)
  const normalizedPhone = normalizePhone(input.phone)

  if (sourceEventId) {
    const priorEvent = await Lead.findOne({ brokerageId, sourceEventId }).populate('assignedAdvisorId', 'name email')
    if (priorEvent) return { lead: serializeLead(priorEvent), duplicateEvent: true }
  }

  await throwDuplicateIfFound(brokerageId, normalizedEmail, normalizedPhone)
  try {
    const lead = await Lead.create({
      brokerageId,
      ...input,
      email: normalizedEmail,
      emailNormalized: normalizedEmail,
      phoneNormalized: normalizedPhone,
      ...(sourceEventId ? { sourceEventId } : {}),
    })
    const populated = await lead.populate('assignedAdvisorId', 'name email')
    const summary = serializeLead(populated)
    publish('created', brokerageId, summary.id, summary)
    return { lead: summary, duplicateEvent: false }
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      if (sourceEventId) {
        const priorEvent = await Lead.findOne({ brokerageId, sourceEventId }).populate('assignedAdvisorId', 'name email')
        if (priorEvent) return { lead: serializeLead(priorEvent), duplicateEvent: true }
      }
      return handleUniqueConflict(brokerageId, normalizedEmail, normalizedPhone)
    }
    throw error
  }
}

export async function createLead(user: AuthenticatedUser, input: LeadInput) {
  const brokerageId = await resolveLeadBrokerage(user, input.brokerageId)
  return createLeadRecord(brokerageId, input)
}

export async function createWebhookLead(brokerageId: string, input: LeadInput, eventId?: string) {
  return createLeadRecord(brokerageId, input, eventId)
}

export async function listLeads(user: AuthenticatedUser, brokerageId?: string, status?: LeadStatus) {
  const filter = await resolveLeadListFilter(user, brokerageId)
  if (status) filter.status = status
  const leads = await Lead.find(filter).populate('assignedAdvisorId', 'name email').sort({ createdAt: -1 })
  return leads.map(serializeLead)
}

async function getLeadDocument(user: AuthenticatedUser, leadId: string): Promise<LeadDocument> {
  if (!Types.ObjectId.isValid(leadId)) throw new AppError(404, 'Lead not found.')
  const filter: FilterQuery<LeadDocument> = { _id: leadId }
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to manage leads.')
    filter.brokerageId = user.brokerageId
  }
  const lead = await Lead.findOne(filter)
    .select('+emailNormalized +phoneNormalized')
    .populate('assignedAdvisorId', 'name email')
  if (!lead) throw new AppError(404, 'Lead not found.')
  return lead
}

export async function getLead(user: AuthenticatedUser, leadId: string): Promise<LeadSummary> {
  return serializeLead(await getLeadDocument(user, leadId))
}

export async function updateLead(user: AuthenticatedUser, leadId: string, patch: LeadPatch): Promise<LeadSummary> {
  const current = await getLeadDocument(user, leadId)
  const nextEmail = patch.email ? normalizeEmail(patch.email) : current.emailNormalized
  const nextPhone = patch.phone ? normalizePhone(patch.phone) : current.phoneNormalized
  if (patch.email || patch.phone) await throwDuplicateIfFound(current.brokerageId.toString(), nextEmail, nextPhone, leadId)

  const set: Record<string, unknown> = { ...patch }
  if (patch.email) {
    set.email = nextEmail
    set.emailNormalized = nextEmail
  }
  if (patch.phone) {
    set.phoneNormalized = nextPhone
  }

  try {
    const filter: FilterQuery<LeadDocument> = { _id: leadId }
    if (user.role !== ROLES.PLATFORM_ADMIN) filter.brokerageId = current.brokerageId
    const updated = await Lead.findOneAndUpdate(filter, { $set: set }, { new: true, runValidators: true })
    if (!updated) throw new AppError(404, 'Lead not found.')
    const summary = serializeLead(updated)
    publish('updated', summary.brokerageId, summary.id, summary)
    return summary
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return handleUniqueConflict(current.brokerageId.toString(), nextEmail, nextPhone)
    }
    throw error
  }
}

export async function changeLeadStatus(
  user: AuthenticatedUser,
  leadId: string,
  status: LeadStatus,
  expectedUpdatedAt: string,
): Promise<LeadSummary> {
  if (!LEAD_STATUSES.includes(status)) throw new AppError(400, 'Invalid lead status.')
  const filter: FilterQuery<LeadDocument> = { _id: leadId, updatedAt: new Date(expectedUpdatedAt) }
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to manage leads.')
    filter.brokerageId = user.brokerageId
  }
  const updated = await Lead.findOneAndUpdate(filter, { $set: { status } }, { new: true, runValidators: true })
    .populate('assignedAdvisorId', 'name email')
  if (!updated) {
    const stillExists = await getLeadDocument(user, leadId).catch(() => null)
    if (!stillExists) throw new AppError(404, 'Lead not found.')
    throw new AppError(409, 'This lead changed since you loaded it. Refresh and retry.')
  }
  const summary = serializeLead(updated)
  publish('status', summary.brokerageId, summary.id, summary)
  return summary
}

export async function assignLead(
  user: AuthenticatedUser,
  leadId: string,
  assignedAdvisorId: string | null,
): Promise<LeadSummary> {
  const current = await getLeadDocument(user, leadId)
  if (assignedAdvisorId !== null) {
    if (!Types.ObjectId.isValid(assignedAdvisorId)) throw new AppError(400, 'Invalid advisor ID.')
    const advisor = await User.findOne({
      _id: assignedAdvisorId,
      role: ROLES.ADVISOR,
      brokerageId: current.brokerageId,
    }).select('_id')
    if (!advisor) throw new AppError(400, 'The advisor must belong to this lead’s brokerage.')
  }
  current.assignedAdvisorId = assignedAdvisorId ? new Types.ObjectId(assignedAdvisorId) : null
  await current.save()
  const populated = await current.populate('assignedAdvisorId', 'name email')
  const summary = serializeLead(populated)
  publish('assigned', summary.brokerageId, summary.id, summary)
  return summary
}

export async function deleteLead(user: AuthenticatedUser, leadId: string): Promise<void> {
  const lead = await getLeadDocument(user, leadId)
  await lead.deleteOne()
  publish('deleted', lead.brokerageId.toString(), lead.id, null)
}

export async function listLeadAdvisors(user: AuthenticatedUser, requestedBrokerageId?: string) {
  const brokerageId = user.role === ROLES.PLATFORM_ADMIN
    ? requestedBrokerageId
    : await resolveLeadBrokerage(user, requestedBrokerageId)

  if (user.role === ROLES.PLATFORM_ADMIN && brokerageId) await ensureBrokerageExists(brokerageId)
  const filter = { role: ROLES.ADVISOR, ...(brokerageId ? { brokerageId } : {}) }
  const advisors = await User.find(filter).select('name email brokerageId').sort({ name: 1 })
  return advisors.map((advisor) => ({
    id: advisor.id,
    name: advisor.name,
    email: advisor.email,
    brokerageId: advisor.brokerageId?.toString() ?? null,
  }))
}

export async function listLeadBrokerages(user: AuthenticatedUser) {
  if (user.role === ROLES.PLATFORM_ADMIN) {
    return Brokerage.find().select('name').sort({ name: 1 }).lean()
  }
  if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to manage leads.')
  const brokerage = await Brokerage.findById(user.brokerageId).select('name').lean()
  return brokerage ? [brokerage] : []
}

export async function findLeadForWebhookIdempotency(brokerageId: string, eventId: string) {
  const existing = await Lead.findOne({ brokerageId, sourceEventId: eventId }).populate('assignedAdvisorId', 'name email')
  return existing ? serializeLead(existing) : null
}