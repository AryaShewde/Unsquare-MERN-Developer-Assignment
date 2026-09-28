export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  BROKERAGE_ADMIN: 'BROKERAGE_ADMIN',
  ADVISOR: 'ADVISOR',
  CLIENT: 'CLIENT',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]