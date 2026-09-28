import type { AuthUser, LoginResponse } from '../types/auth'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function parseResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json()
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'error' in body
      && typeof body.error === 'string'
      ? body.error
      : 'The request could not be completed.'
    throw new Error(message)
  }
  return body as T
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return parseResponse<LoginResponse>(response)
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await parseResponse<{ user: AuthUser }>(response)
  return body.user
}