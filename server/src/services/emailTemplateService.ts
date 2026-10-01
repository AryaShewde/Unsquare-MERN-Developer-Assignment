import { Types, type FilterQuery } from 'mongoose'
import { EmailTemplate, type EmailTemplateDocument } from '../models/EmailTemplate.js'
import { ROLES } from '../models/roles.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'
import { AppError } from '../utils/AppError.js'

export interface EmailTemplateInput {
  name: string
  subject: string
  body: string
  active?: boolean
  brokerageId?: string
}

export interface EmailTemplatePatch {
  name?: string
  subject?: string
  body?: string
  active?: boolean
}

export interface EmailTemplateSummary {
  id: string
  brokerageId: string
  name: string
  subject: string
  body: string
  active: boolean
  createdAt: string
  updatedAt: string
}

function serializeTemplate(template: EmailTemplateDocument): EmailTemplateSummary {
  const obj = template.toObject() as Record<string, unknown>
  return {
    id: String(obj._id),
    brokerageId: String(obj.brokerageId),
    name: String(obj.name),
    subject: String(obj.subject),
    body: String(obj.body),
    active: Boolean(obj.active),
    createdAt: new Date(obj.createdAt as string | Date).toISOString(),
    updatedAt: new Date(obj.updatedAt as string | Date).toISOString(),
  }
}

async function resolveTemplateBrokerageFilter(
  user: AuthenticatedUser,
  requestedBrokerageId?: string,
): Promise<FilterQuery<EmailTemplateDocument>> {
  if (user.role === ROLES.PLATFORM_ADMIN) {
    if (requestedBrokerageId) {
      if (!Types.ObjectId.isValid(requestedBrokerageId)) {
        throw new AppError(400, 'Invalid brokerage ID.')
      }
      return { brokerageId: requestedBrokerageId }
    }
    return {}
  }
  if (!user.brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }
  if (requestedBrokerageId && requestedBrokerageId.toLowerCase() !== user.brokerageId.toLowerCase()) {
    throw new AppError(403, 'Cannot access another brokerage.')
  }
  return { brokerageId: user.brokerageId }
}

export async function listEmailTemplates(user: AuthenticatedUser, brokerageId?: string) {
  const filter = await resolveTemplateBrokerageFilter(user, brokerageId)

  if (user.role === ROLES.CLIENT) {
    throw new AppError(403, 'Clients cannot access email templates.')
  }

  const templates = await EmailTemplate.find(filter).sort({ name: 1 })
  return templates.map(serializeTemplate)
}

export async function getEmailTemplate(user: AuthenticatedUser, templateId: string) {
  if (!Types.ObjectId.isValid(templateId)) {
    throw new AppError(404, 'Template not found.')
  }

  const filter: FilterQuery<EmailTemplateDocument> = { _id: templateId }
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    if (!user.brokerageId) {
      throw new AppError(403, 'A brokerage is required.')
    }
    filter.brokerageId = user.brokerageId
  }

  const template = await EmailTemplate.findOne(filter)
  if (!template) {
    throw new AppError(404, 'Template not found.')
  }

  return serializeTemplate(template)
}

export async function createEmailTemplate(user: AuthenticatedUser, input: EmailTemplateInput) {
  if (user.role !== ROLES.BROKERAGE_ADMIN && user.role !== ROLES.PLATFORM_ADMIN) {
    throw new AppError(403, 'Only Brokerage Admins can create email templates.')
  }

  const brokerageId = user.role === ROLES.PLATFORM_ADMIN
    ? input.brokerageId
    : user.brokerageId

  if (!brokerageId) {
    throw new AppError(403, 'A brokerage is required.')
  }

  try {
    const template = await EmailTemplate.create({
      brokerageId: new Types.ObjectId(brokerageId),
      name: input.name,
      subject: input.subject,
      body: input.body,
      active: input.active ?? true,
    })
    return serializeTemplate(template)
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(400, 'A template with this name already exists for this brokerage.')
    }
    throw error
  }
}

export async function updateEmailTemplate(user: AuthenticatedUser, templateId: string, patch: EmailTemplatePatch) {
  if (user.role !== ROLES.BROKERAGE_ADMIN && user.role !== ROLES.PLATFORM_ADMIN) {
    throw new AppError(403, 'Only Brokerage Admins can update email templates.')
  }

  const existing = await getEmailTemplate(user, templateId)

  const update: Record<string, unknown> = {}
  if (patch.name !== undefined) update.name = patch.name
  if (patch.subject !== undefined) update.subject = patch.subject
  if (patch.body !== undefined) update.body = patch.body
  if (patch.active !== undefined) update.active = patch.active

  try {
    const updated = await EmailTemplate.findOneAndUpdate(
      { _id: templateId },
      { $set: update },
      { new: true, runValidators: true },
    )
    if (!updated) {
      throw new AppError(404, 'Template not found.')
    }
    return serializeTemplate(updated)
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(400, 'A template with this name already exists for this brokerage.')
    }
    throw error
  }
}

export async function deleteEmailTemplate(user: AuthenticatedUser, templateId: string) {
  if (user.role !== ROLES.BROKERAGE_ADMIN && user.role !== ROLES.PLATFORM_ADMIN) {
    throw new AppError(403, 'Only Brokerage Admins can delete email templates.')
  }

  await getEmailTemplate(user, templateId)
  await EmailTemplate.deleteOne({ _id: templateId })
}