import type { Request, Response } from 'express'
import { getCaseForUser, getClientCases, getMyCases, listBrokerageClients } from '../services/clientCaseService.js'
import { listCaseDocuments, listMyDocuments } from '../services/documentService.js'
import { AppError } from '../utils/AppError.js'

function getParam(value: string | string[] | undefined, label: string): string {
  if (typeof value !== 'string') throw new AppError(400, `Invalid ${label}.`)
  return value
}

export async function getMyCasesController(request: Request, response: Response): Promise<void> {
  response.json({ cases: await getMyCases(request.user!) })
}

export async function getClientCasesController(request: Request, response: Response): Promise<void> {
  response.json({ cases: await getClientCases(request.user!, getParam(request.params.clientId, 'client ID')) })
}

export async function listClientsController(request: Request, response: Response): Promise<void> {
  response.json({ clients: await listBrokerageClients(request.user!) })
}

export async function getCaseController(request: Request, response: Response): Promise<void> {
  response.json({ clientCase: await getCaseForUser(request.user!, getParam(request.params.caseId, 'case ID')) })
}

export async function listCaseDocumentsController(request: Request, response: Response): Promise<void> {
  const caseId = getParam(request.params.caseId, 'case ID')
  await getCaseForUser(request.user!, caseId)
  response.json({ documents: await listCaseDocuments(request.user!, caseId) })
}

export async function listMyDocumentsController(request: Request, response: Response): Promise<void> {
  response.json({ documents: await listMyDocuments(request.user!) })
}