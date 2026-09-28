import type { HealthResponse } from '../types/health'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function fetchHealth(): Promise<HealthResponse> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}/api/health`)
  } catch {
    throw new Error('Could not connect to the backend. Check that the API server is running.')
  }

  if (!response.ok) {
    throw new Error(`Backend health check failed with status ${response.status}.`)
  }

  return response.json() as Promise<HealthResponse>
}