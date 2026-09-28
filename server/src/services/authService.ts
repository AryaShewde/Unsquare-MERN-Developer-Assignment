import { User } from '../models/User.js'
import { createToken } from './tokenService.js'
import { verifyPassword } from './passwordService.js'
import { AppError } from '../utils/AppError.js'
import { toSafeProfile } from './profileService.js'

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash')
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.')
  }

  return {
    token: createToken(user.id),
    user: await toSafeProfile(user),
  }
}