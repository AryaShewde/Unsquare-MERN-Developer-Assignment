import type { Request, Response } from 'express'
import { DOCUMENT_TYPES } from '../models/Document.js'
import {
  getDocumentById,
  getDocumentDownload,
  retryDocumentVerification,
  uploadClientDocument,
} from '../services/documentService.js'
import { AppError } from '../utils/AppError.js'

function getDocumentId(request: Request): string {
  const id = request.params.documentId
  if (typeof id !== 'string') throw new AppError(400, 'Invalid document ID.')
  return id
}

export async function uploadClientDocumentController(request: Request, response: Response): Promise<void> {
  const documentType = request.body?.documentType
  if (typeof documentType !== 'string' || !(DOCUMENT_TYPES as readonly string[]).includes(documentType)) {
    response.status(400).json({ error: 'Choose a valid document type.' })
    return
  }
  const document = await uploadClientDocument(request.user!, request.file, documentType)
  response.status(201).json({ document })
}

export async function getDocumentController(request: Request, response: Response): Promise<void> {
  response.json({ document: await getDocumentById(request.user!, getDocumentId(request)) })
}

export async function getDocumentDownloadController(request: Request, response: Response): Promise<void> {
  response.json(await getDocumentDownload(request.user!, getDocumentId(request)))
}

export async function retryDocumentController(request: Request, response: Response): Promise<void> {
  response.json({ document: await retryDocumentVerification(request.user!, getDocumentId(request)) })
}