import type { Request, Response } from 'express'
import { createWebhookLead } from '../services/leadService.js'
import { AppError } from '../utils/AppError.js'

export async function createTallyLeadController(request: Request, response: Response): Promise<void> {
  const { data } = request.body
  // Support both submission_id (old) and submissionId (new)
  const submissionId = data?.submission_id ?? data?.submissionId
  if (!data || !data.fields || !submissionId) {
    throw new AppError(400, 'Invalid Tally payload.')
  }

  // Map values using field key (highest priority), ref, or id
  const answerMap = new Map<string, any>()
  for (const answer of data.fields) {
    // Tally payload can have answers as {key, value} directly
    // or nested within {field: {key, ...}, value }
    const key = answer.key ?? answer.field?.key ?? answer.field?.ref ?? answer.field?.id
    if (key) answerMap.set(key, answer.value)
  }

  // Helper to extract value by potential stable identifiers
  const getMappedValue = (...keys: (string | undefined)[]) => {
      for (const key of keys) {
        if (key && answerMap.has(key)) return answerMap.get(key)
      }
      return undefined
  }

  const leadInput = {
    firstName: getMappedValue(process.env.TALLY_FIRST_NAME_REF) as string,
    lastName: getMappedValue(process.env.TALLY_LAST_NAME_REF) as string,
    email: getMappedValue(process.env.TALLY_EMAIL_REF) as string,
    phone: getMappedValue(process.env.TALLY_PHONE_REF) as string,
    source: 'TALLY',
  }

  if (!leadInput.firstName || !leadInput.lastName || !leadInput.email || !leadInput.phone) {
    throw new AppError(400, 'Missing required lead fields in Tally submission.')
  }

  const eventId = submissionId
  const result = await createWebhookLead(request.webhookBrokerageId!, leadInput, eventId)
  
  response.status(result.duplicateEvent ? 200 : 201).json({ lead: result.lead })
}
