import { AppShell } from '../components/layout/AppShell'
import { PipelineBoard } from '../components/PipelineBoard'
import { AdvisorClients } from '../components/AdvisorClients'
import { ClientPortal } from '../components/ClientPortal'
import { AutomationAdmin } from '../components/AutomationAdmin'
import { TaskBoard } from '../components/TaskBoard'
import { useAuth } from '../auth/useAuth'

export function AuthenticatedPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <AppShell>
      <section className="py-8">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">LeadFlow Workspace</h1>
        
        {/* Role-based sections */}
        <div className="mt-8">
          {user.role === 'CLIENT' ? (
            <ClientPortal />
          ) : user.role === 'BROKERAGE_ADMIN' ? (
            <>
              <PipelineBoard />
              <AdvisorClients />
              <AutomationAdmin />
            </>
          ) : user.role === 'ADVISOR' ? (
            <>
              <PipelineBoard />
              <TaskBoard />
              <AdvisorClients />
            </>
          ) : user.role === 'PLATFORM_ADMIN' ? (
            <>
              <PipelineBoard />
              <AdvisorClients />
              <AutomationAdmin />
            </>
          ) : null}
        </div>
      </section>
    </AppShell>
  )
}
