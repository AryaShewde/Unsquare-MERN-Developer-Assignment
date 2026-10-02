import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useTheme } from '../auth/ThemeContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { user, login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-6">
        <header className="flex w-full items-center justify-between border-b border-border pb-5 mb-10">
          <a className="font-semibold tracking-tight text-primary" href="/login">
            LeadFlow
          </a>
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </header>

        <section className="grid w-full gap-12 md:grid-cols-[1fr_0.5fr] md:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase text-muted-foreground">Secure workspace</p>
            <h1 className="text-5xl font-semibold tracking-tight">Welcome back.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
              Sign in to verify your LeadFlow account and brokerage access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="border border-border bg-card p-7 shadow-sm">
            <h2 className="mb-6 text-sm font-semibold">Sign in</h2>
            
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />

            {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
            
            <Button
              className="w-full"
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}