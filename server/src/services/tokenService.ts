import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new AppError(503, 'Authentication is not configured. Set a JWT_SECRET of at least 32 characters.')
  }
  return secret
}

export function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '1h' })
}

export function verifyToken(token: string): string {
  const decoded = jwt.verify(token, getJwtSecret())
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Invalid token subject')
  }
  return decoded.sub
}