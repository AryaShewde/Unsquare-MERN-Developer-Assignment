export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'APPLICATION',
  'WON',
  'LOST',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]