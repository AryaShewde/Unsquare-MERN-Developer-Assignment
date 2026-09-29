import type { LeadSummary } from '../services/leadTypes.js'
import { AppError } from './AppError.js'

export class DuplicateLeadError extends AppError {
  constructor(public readonly existingLead: LeadSummary) {
    super(409, 'A lead with this email or phone already exists in this brokerage.')
    this.name = 'DuplicateLeadError'
  }
}