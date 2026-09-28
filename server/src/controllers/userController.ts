import { Types } from 'mongoose'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { Brokerage } from '../models/Brokerage.js'
import { ROLES, type UserRole } from '../models/roles.js'
import { User } from '../models/User.js'
import { hashPassword } from '../services/passwordService.js'
import { toSafeProfile } from '../services/profileService.js'
import { AppError } from '../utils/AppError.js'
import { assertBrokerageAccess } from '../utils/tenantAccess.js'

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(Object.values(ROLES) as [UserRole, ...UserRole[]]),
  brokerageId: z.string().nullable().optional(),
})

async function loadManagedUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(404, 'User not found.')
  }
  const user = await User.findById(userId).select('name email role brokerageId')
  if (!user) {
    throw new AppError(404, 'User not found.')
  }
  return user
}

export async function listUsers(request: Request, response: Response): Promise<void> {
  const currentUser = request.user!
  const filter = currentUser.role === ROLES.PLATFORM_ADMIN
    ? {}
    : { brokerageId: currentUser.brokerageId }
  const users = await User.find(filter).select('name email role brokerageId').sort({ email: 1 })
  response.json({ users: await Promise.all(users.map(toSafeProfile)) })
}

export async function getManagedUser(request: Request, response: Response): Promise<void> {
  const currentUser = request.user!
  const requestedUserId = request.params.userId
  if (typeof requestedUserId !== 'string') {
    throw new AppError(404, 'User not found.')
  }
  const user = await loadManagedUser(requestedUserId)
  if (user.brokerageId) {
    assertBrokerageAccess(currentUser, user.brokerageId.toString())
  } else if (currentUser.role !== ROLES.PLATFORM_ADMIN) {
    throw new AppError(404, 'User not found.')
  }
  response.json({ user: await toSafeProfile(user) })
}

export async function createUser(request: Request, response: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid user data.' })
    return
  }

  const currentUser = request.user!
  const { role, brokerageId: requestedBrokerageId } = parsed.data
  if (role === ROLES.PLATFORM_ADMIN && currentUser.role !== ROLES.PLATFORM_ADMIN) {
    throw new AppError(403, 'Only a Platform Admin can create a Platform Admin.')
  }
  if (role === ROLES.PLATFORM_ADMIN && requestedBrokerageId) {
    response.status(400).json({ error: 'Platform Admin users cannot belong to a brokerage.' })
    return
  }

  let brokerageId: string | null = null
  if (role !== ROLES.PLATFORM_ADMIN) {
    brokerageId = currentUser.role === ROLES.PLATFORM_ADMIN
      ? requestedBrokerageId ?? null
      : currentUser.brokerageId

    if (!brokerageId) {
      response.status(400).json({ error: 'A brokerageId is required for this role.' })
      return
    }
    if (currentUser.role !== ROLES.PLATFORM_ADMIN && requestedBrokerageId
      && requestedBrokerageId !== currentUser.brokerageId) {
      throw new AppError(403, 'You cannot assign a user to another brokerage.')
    }
    if (!Types.ObjectId.isValid(brokerageId) || !(await Brokerage.exists({ _id: brokerageId }))) {
      response.status(400).json({ error: 'The selected brokerage is invalid.' })
      return
    }
  }

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    role,
    brokerageId,
  })
  response.status(201).json({ user: await toSafeProfile(user) })
}