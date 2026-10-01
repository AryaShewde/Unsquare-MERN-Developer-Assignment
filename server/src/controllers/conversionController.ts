import type { Request, Response } from 'express'
import { convertLeadToClient } from '../services/clientCaseService.js'
import { AppError } from '../utils/AppError.js'

export async function convertLeadController(request: Request, response: Response): Promise<void> {
  const leadId = request.params.leadId
  if (typeof leadId !== 'string') throw new AppError(400, 'Invalid lead ID.')
  response.status(201).json(await convertLeadToClient(request.user!, leadId))
}