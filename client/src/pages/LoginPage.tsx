import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { user, login } = useAuth()
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
    <main className="min-h-screen bg-gradient-premium text-foreground transition-colors duration-500">
      <header className="fixed top-0 left-0 right-0 flex h-16 items-center justify-between border-b border-border/50 px-6 sm:px-10 bg-background/80 backdrop-blur-sm z-50">
        <a className="text-xl font-bold tracking-tighter text-primary" href="/login">
          LeadFlow
        </a>
      </header>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-6 pt-20">

        <section className="grid w-full gap-12 md:grid-cols-[1fr_0.5fr] md:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-widest text-primary">Secure workspace</p>
            <h1 className="text-5xl font-extrabold tracking-tight">Welcome back.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
              Sign in to verify your LeadFlow account and brokerage access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="border border-border bg-card p-8 rounded-2xl shadow-2xl">
            <h2 className="mb-6 text-lg font-semibold">Sign in</h2>
            
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              required
              placeholder="name@company.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-6"
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