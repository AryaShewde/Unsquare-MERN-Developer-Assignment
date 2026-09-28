import type { Request, Response } from 'express'
import { z } from 'zod'
import { login } from '../services/authService.js'
import { User } from '../models/User.js'
import { toSafeProfile } from '../services/profileService.js'
import { AppError } from '../utils/AppError.js'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export async function loginController(request: Request, response: Response): Promise<void> {
  const parsed = loginSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid login request.' })
    return
  }
  response.json(await login(parsed.data.email, parsed.data.password))
}

export async function meController(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new AppError(401, 'Authentication required.')
  }
  const user = await User.findById(request.user.id).select('name email role brokerageId')
  if (!user) {
    throw new AppError(401, 'Invalid or expired token.')
  }
  response.json({ user: await toSafeProfile(user) })
}