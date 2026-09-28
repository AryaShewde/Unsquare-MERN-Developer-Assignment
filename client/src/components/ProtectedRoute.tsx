import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f3f2ec] text-sm text-[#687269]">Checking session...</main>
  }
  return user ? children : <Navigate to="/login" replace />
}