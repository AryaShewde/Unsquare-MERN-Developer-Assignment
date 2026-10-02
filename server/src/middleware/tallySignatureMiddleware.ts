import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'

export function verifyTallySignature(request: Request, response: Response, next: NextFunction): void {
  const secret = process.env.TALLY_WEBHOOK_SIGNING_SECRET
  if (!secret) {
    next(new AppError(500, 'Tally webhook secret not configured.'))
    return
  }

  const signature = request.header('tally-signature')
  console.log('Received signature:', signature)
  if (!signature) {
    console.error('Tally signature missing.')
    next(new AppError(401, 'Tally signature missing.'))
    return
  }

  // Expect raw buffer from express.raw()
  if (!Buffer.isBuffer(request.body)) {
    next(new AppError(400, 'Raw body not found.'))
    return
  }

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(request.body)
  const calculatedSignature = hmac.digest('base64')

  // Timing-safe comparison
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const calculatedSignatureBuffer = Buffer.from(calculatedSignature, 'utf8')
  
  if (signatureBuffer.length !== calculatedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, calculatedSignatureBuffer)) {
    next(new AppError(401, 'Invalid Tally signature.'))
    return
  }

  // Parse body for downstream middleware/controller
  try {
    request.body = JSON.parse(request.body.toString('utf8'))
  } catch (e) {
    next(new AppError(400, 'Invalid JSON body.'))
    return
  }

  next()
}
