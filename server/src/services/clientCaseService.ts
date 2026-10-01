import { randomBytes } from 'node:crypto'
import { Types } from 'mongoose'
import { ClientCase } from '../models/ClientCase.js'
import { Lead } from '../models/Lead.js'
import { ROLES } from '../models/roles.js'
import { User } from '../models/User.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { hashPassword } from './passwordService.js'
import { toSafeProfile } from './profileService.js'
import { publishLeadDomainUpdate, serializeLead } from './leadService.js'
import { AppError } from '../utils/AppError.js'

export interface SafeCase {
  id: string
  brokerageId: string
  leadId: string
  clientUserId: string
  clientName: string
  clientEmail: string
  advisorId: string | null
  advisorName: string | null
  applicationStatus: string
  createdAt: string
  updatedAt: string
}

function serializeCase(clientCase: Record<string, unknown> & { _id: Types.ObjectId }): SafeCase {
  const client = clientCase.clientUserId as { _id?: Types.ObjectId; id?: string; name?: string; email?: string } | undefined
  const advisor = clientCase.advisorId as { _id?: Types.ObjectId; id?: string; name?: string } | null | undefined
  const idOf = (value: { _id?: Types.ObjectId; id?: string } | undefined | null) =>
    value ? String(value._id ?? value.id) : null
  return {
    id: String(clientCase._id),
    brokerageId: String(clientCase.brokerageId),
    leadId: String(clientCase.leadId),
    clientUserId: idOf(client) ?? String(clientCase.clientUserId),
    clientName: client?.name ?? '',
    clientEmail: client?.email ?? '',
    advisorId: idOf(advisor),
    advisorName: advisor?.name ?? null,
    applicationStatus: String(clientCase.applicationStatus),
    createdAt: new Date(clientCase.createdAt as string | Date).toISOString(),
    updatedAt: new Date(clientCase.updatedAt as string | Date).toISOString(),
  }
}

function assertTenant(user: AuthenticatedUser, brokerageId: Types.ObjectId): void {
  if (user.role !== ROLES.PLATFORM_ADMIN && user.brokerageId?.toLowerCase() !== brokerageId.toString().toLowerCase()) {
    throw new AppError(404, 'Case not found.')
  }
}

export async function convertLeadToClient(user: AuthenticatedUser, leadId: string) {
  if (!Types.ObjectId.isValid(leadId)) throw new AppError(404, 'Lead not found.')
  const leadFilter: Record<string, unknown> = { _id: leadId }
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    if (!user.brokerageId) throw new AppError(403, 'A brokerage is required to convert leads.')
    leadFilter.brokerageId = user.brokerageId
  }

  const lead = await Lead.findOne(leadFilter).populate('assignedAdvisorId', 'name email')
  if (!lead) throw new AppError(404, 'Lead not found.')
  if (lead.convertedCaseId) throw new AppError(409, 'This lead has already been converted.')

  const existingAccount = await User.exists({ email: lead.email.toLowerCase() })
  if (existingAccount) throw new AppError(409, 'A user account already exists for this email. Resolve the account before converting this lead.')

  const temporaryPassword = randomBytes(18).toString('base64url')
  const passwordHash = await hashPassword(temporaryPassword)
  let clientUserId: Types.ObjectId | null = null
  let caseId: Types.ObjectId | null = null

  try {
    const clientUser = await User.create({
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      email: lead.email.toLowerCase(),
      passwordHash,
      role: ROLES.CLIENT,
      brokerageId: lead.brokerageId,
    })
    clientUserId = clientUser._id

    const createdCase = await ClientCase.create({
      brokerageId: lead.brokerageId,
      leadId: lead._id,
      clientUserId: clientUser._id,
      advisorId: lead.assignedAdvisorId?._id ?? null,
      applicationStatus: 'STARTED',
    })
    caseId = createdCase._id

    const convertedLead = await Lead.findOneAndUpdate(
      { _id: lead._id, brokerageId: lead.brokerageId, convertedCaseId: null },
      { $set: { convertedCaseId: createdCase._id, convertedAt: new Date(), status: 'WON' } },
      { new: true, runValidators: true },
    ).populate('assignedAdvisorId', 'name email')

    if (!convertedLead) throw new AppError(409, 'This lead was converted by another request. Refresh the lead list.')

    const safeLead = serializeLead(convertedLead)
    publishLeadDomainUpdate(safeLead)
    return {
      client: await toSafeProfile(clientUser),
      clientCase: serializeCase(await createdCase.populate([
        { path: 'clientUserId', select: 'name email' },
        { path: 'advisorId', select: 'name' },
      ]) as unknown as Record<string, unknown> & { _id: Types.ObjectId }),
      temporaryPassword,
      lead: safeLead,
    }
  } catch (error) {
    if (caseId) await ClientCase.deleteOne({ _id: caseId })
    if (clientUserId) await User.deleteOne({ _id: clientUserId })
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(409, 'This lead or client account has already been converted.')
    }
    throw error
  }
}

async function loadCasesForClient(clientUserId: Types.ObjectId, brokerageId: Types.ObjectId) {
  return ClientCase.find({ clientUserId, brokerageId })
    .populate('clientUserId', 'name email')
    .populate('advisorId', 'name')
    .sort({ createdAt: -1 })
}

export async function getMyCases(user: AuthenticatedUser): Promise<SafeCase[]> {
  if (user.role !== ROLES.CLIENT || !user.brokerageId) throw new AppError(403, 'Client access required.')
  const cases = await loadCasesForClient(new Types.ObjectId(user.id), new Types.ObjectId(user.brokerageId))
  return cases.map((clientCase) => serializeCase(clientCase as unknown as Record<string, unknown> & { _id: Types.ObjectId }))
}

export async function getClientCases(user: AuthenticatedUser, clientId: string): Promise<SafeCase[]> {
  if (!Types.ObjectId.isValid(clientId)) throw new AppError(404, 'Client not found.')
  const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT }).select('brokerageId')
  if (!client?.brokerageId) throw new AppError(404, 'Client not found.')
  assertTenant(user, client.brokerageId)
  const cases = await loadCasesForClient(client._id, client.brokerageId)
  return cases.map((clientCase) => serializeCase(clientCase as unknown as Record<string, unknown> & { _id: Types.ObjectId }))
}

export async function listBrokerageClients(user: AuthenticatedUser) {
  const filter = user.role === ROLES.PLATFORM_ADMIN
    ? { role: ROLES.CLIENT }
    : { role: ROLES.CLIENT, brokerageId: user.brokerageId }
  if (user.role !== ROLES.PLATFORM_ADMIN && !user.brokerageId) throw new AppError(403, 'A brokerage is required.')
  const clients = await User.find(filter).select('name email role brokerageId').sort({ name: 1 })
  const records = await Promise.all(clients.map(async (client) => {
    const cases = await loadCasesForClient(client._id, client.brokerageId!)
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      brokerageId: client.brokerageId?.toString() ?? null,
      cases: cases.map((clientCase) => serializeCase(clientCase as unknown as Record<string, unknown> & { _id: Types.ObjectId })),
    }
  }))
  return records
}

export async function getCaseForUser(user: AuthenticatedUser, caseId: string): Promise<SafeCase> {
  if (!Types.ObjectId.isValid(caseId)) throw new AppError(404, 'Case not found.')
  const filter: Record<string, unknown> = { _id: caseId }
  if (user.role === ROLES.CLIENT) {
    filter.clientUserId = user.id
    filter.brokerageId = user.brokerageId
  } else if (user.role !== ROLES.PLATFORM_ADMIN) {
    filter.brokerageId = user.brokerageId
  }
  const clientCase = await ClientCase.findOne(filter)
    .populate('clientUserId', 'name email')
    .populate('advisorId', 'name')
  if (!clientCase) throw new AppError(404, 'Case not found.')
  return serializeCase(clientCase as unknown as Record<string, unknown> & { _id: Types.ObjectId })
}