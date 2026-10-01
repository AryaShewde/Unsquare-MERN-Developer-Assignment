import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { PipelineBoard } from '../components/PipelineBoard'
import { AdvisorClients } from '../components/AdvisorClients'
import { ClientPortal } from '../components/ClientPortal'

export function AuthenticatedPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-[#f3f2ec] px-5 py-10 text-[#202923] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#d5d8ce] pb-5">
          <a className="font-semibold tracking-tight" href="/" aria-label="LeadFlow home">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#d66b45]" />
            leadflow<span className="text-[#718073]">/</span>workspace
          </a>
          <button onClick={handleLogout} className="border border-[#cbd0c7] px-3 py-2 text-sm font-medium hover:bg-white" type="button">
            Sign out
          </button>
        </header>

        <section className="py-16 sm:py-24">
          <p className="mb-5 font-mono text-xs uppercase text-[#9b583b]">Authentication check</p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">You’re signed in.</h1>
          <div className="mt-10 max-w-2xl border-t-2 border-[#26372d] bg-white/70 p-6 sm:p-7">
            <h2 className="mb-6 text-sm font-semibold">Account profile</h2>
            <dl className="grid gap-5 sm:grid-cols-[150px_1fr]">
              <dt className="text-sm text-[#687269]">Name</dt><dd className="text-sm font-medium">{user.name}</dd>
              <dt className="text-sm text-[#687269]">Email</dt><dd className="text-sm font-medium">{user.email}</dd>
              <dt className="text-sm text-[#687269]">Role</dt><dd className="text-sm font-medium">{user.role.replaceAll('_', ' ')}</dd>
              <dt className="text-sm text-[#687269]">Brokerage</dt><dd className="text-sm font-medium">{user.brokerageName ?? 'Platform-wide'}</dd>
            </dl>
          </div>
        </section>
        {user.role === 'CLIENT' ? (
          <ClientPortal />
        ) : (
          <>
            <PipelineBoard />
            <AdvisorClients />
          </>
        )}
      </div>
    </main>
  )
}