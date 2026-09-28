export type UserRole = 'PLATFORM_ADMIN' | 'BROKERAGE_ADMIN' | 'ADVISOR' | 'CLIENT'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  brokerageId: string | null
  brokerageName: string | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
}