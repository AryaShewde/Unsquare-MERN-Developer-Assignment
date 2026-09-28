import type { Request, Response } from 'express'
import { getDatabaseStatus } from '../config/database.js'

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json({
    status: 'ok',
    service: 'leadflow-api',
    database: getDatabaseStatus(),
  })
}