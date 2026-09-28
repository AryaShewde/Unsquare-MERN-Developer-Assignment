import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, loginRequest } from '../services/auth'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './context'

const TOKEN_KEY = 'leadflow.auth.token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    getCurrentUser(token)
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY)
        if (active) {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  async function login(email: string, password: string) {
    const result = await loginRequest(email, password)
    window.localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    setLoading(false)
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setLoading(false)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}