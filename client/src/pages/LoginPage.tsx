import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <main className="min-h-screen bg-[#f3f2ec] px-5 py-10 text-[#202923] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#d5d8ce] pb-5">
          <a className="font-semibold tracking-tight" href="/login" aria-label="LeadFlow home">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#d66b45]" />
            leadflow<span className="text-[#718073]">/</span>access
          </a>
          <span className="font-mono text-xs uppercase text-[#718073]">Phase 02</span>
        </header>

        <section className="grid gap-12 py-16 sm:py-24 md:grid-cols-[1fr_0.75fr] md:items-center">
          <div>
            <p className="mb-5 font-mono text-xs uppercase text-[#9b583b]">Secure workspace</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">Welcome back.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#687269]">
              Sign in to verify your LeadFlow account and brokerage access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="border-t-2 border-[#26372d] bg-white/70 p-6 sm:p-7">
            <h2 className="mb-6 text-sm font-semibold">Sign in</h2>
            <label className="mb-4 block text-sm font-medium" htmlFor="email">
              Email
              <input
                id="email"
                className="mt-2 block w-full border border-[#cbd0c7] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#52695a] focus:ring-2 focus:ring-[#52695a]/20"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="mb-5 block text-sm font-medium" htmlFor="password">
              Password
              <input
                id="password"
                className="mt-2 block w-full border border-[#cbd0c7] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#52695a] focus:ring-2 focus:ring-[#52695a]/20"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && <p role="alert" className="mb-4 border-l-2 border-[#c64e3d] pl-3 text-sm leading-6 text-[#9f392d]">{error}</p>}
            <button
              className="w-full bg-[#26372d] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3c5545] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}