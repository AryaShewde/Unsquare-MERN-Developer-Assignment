export interface HealthResponse {
  status: 'ok'
  service: string
  database: 'connected' | 'disconnected' | 'not_configured'
}