import type { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { DuplicateLeadError } from '../utils/DuplicateLeadError.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.message,
      ...(error instanceof DuplicateLeadError ? { duplicateLead: error.existingLead } : {}),
    })
    return
  }

  if (error?.code === 11000) {
    response.status(409).json({ error: 'A user with this email already exists.' })
    return
  }

  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    response.status(400).json({ error: 'Request data is invalid.' })
    return
  }

  if (error?.name === 'MulterError') {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    response.status(statusCode).json({ error: statusCode === 413 ? 'Documents must be 10 MB or smaller.' : 'Invalid multipart upload.' })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body must be valid JSON.' })
    return
  }

  console.error('Unhandled request error:', error)
  response.status(500).json({ error: 'Internal server error.' })
}