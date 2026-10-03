import { useEffect, useState, type FormEvent, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../auth/useAuth'
import {
  createLeadRequest,
  convertLead,
  fetchLeadAdvisors,
  fetchLeadBrokerages,
  fetchLeads,
  fetchLeadSummary,
  updateLeadAssignment,
  updateLeadStatus,
} from '../services/leads'
import { LEAD_STATUSES, type Lead, type LeadAdvisor, type LeadBrokerage, type LeadStatus } from '../types/lead'
import { PipelineSummary } from './PipelineSummary'
import { LeadCard } from './LeadCard'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const statusLabels: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  APPLICATION: 'Application',
  WON: 'Won',
  LOST: 'Lost',
}

export function PipelineBoard() {
  const { token, user, loading } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [advisors, setAdvisors] = useState<LeadAdvisor[]>([])
  const [brokerages, setBrokerages] = useState<LeadBrokerage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtime, setRealtime] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', source: 'Website', brokerageId: '' })

  function calculateSummaryFromLeads(leads: Lead[]): Record<string, number> {
    const counts: Record<string, number> = { total: leads.length }
    LEAD_STATUSES.forEach(status => {
      counts[status] = leads.filter(l => l.status === status).length
    })
    return counts
  }

  const refreshLeads = useCallback(async () => {
    if (!token || loading) return
    try {
      const result = await fetchLeads(token)
      setLeads(result)
      const fallbackSummary = calculateSummaryFromLeads(result)
      
      try {
        const summaryResult = await fetchLeadSummary(token)
        if (summaryResult && Object.keys(summaryResult).length > 0) {
          setSummary(summaryResult)
        } else {
          setSummary(fallbackSummary)
        }
      } catch {
        setSummary(fallbackSummary)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh leads.')
    }
  }, [token, loading])

  useEffect(() => {
    if (loading || !token) return
    let active = true
    Promise.all([fetchLeads(token), fetchLeadSummary(token), fetchLeadAdvisors(token), fetchLeadBrokerages(token)])
      .then(([loadedLeads, loadedSummary, loadedAdvisors, loadedBrokerages]) => {
        if (!active) return
        setLeads(loadedLeads)
        setSummary(loadedSummary || calculateSummaryFromLeads(loadedLeads))
        setAdvisors(loadedAdvisors)
        setBrokerages(loadedBrokerages)
        setForm((current) => ({ ...current, brokerageId: current.brokerageId || loadedBrokerages[0]?._id || '' }))
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load the pipeline.')
      })
      .finally(() => {
        if (active) setLoadingLeads(false)
      })

    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
      setRealtime('connected');
    }

    const socket = isProduction ? null : io(apiUrl, { auth: { token } })

    if (socket) {
      socket.on('connect', () => {
          setRealtime('connected')
          void refreshLeads()
      })
      socket.on('disconnect', () => setRealtime('disconnected'))
      socket.on('connect_error', () => setRealtime('disconnected'))
      socket.on('pipeline:update', () => {
        void refreshLeads()
      })
    }

    return () => {
      active = false
      if (socket) {
        socket.disconnect()
      }
    }
  }, [token, loading, refreshLeads])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setError(null)
    setSubmitting(true)
    try {
      const newLead = await createLeadRequest(token, {
        ...form,
        ...(user?.role === 'PLATFORM_ADMIN' ? { brokerageId: form.brokerageId } : {}),
      })
      setLeads((current) => current.some((lead) => lead.id === newLead.id) ? current : [newLead, ...current])
      setForm((current) => ({ ...current, firstName: '', lastName: '', email: '', phone: '' }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create the lead.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    if (!token || status === lead.status) return
    setError(null)
    try {
      const updated = await updateLeadStatus(token, lead, status)
      setLeads((current) => current.map((item) => item.id === updated.id ? updated : item))
      void refreshLeads()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not move the lead.')
      await refreshLeads().catch(() => undefined)
    }
  }

  async function handleAssignment(leadId: string, advisorId: string) {
    if (!token) return
    setError(null)
    try {
      const updated = await updateLeadAssignment(token, leadId, advisorId || null)
      setLeads((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not assign the lead.')
    }
  }

  async function handleConvert(lead: Lead) {
    if (!token) return
    setError(null)
    try {
      const result = await convertLead(token, lead.id)
      setLeads((current) => current.map((item) => item.id === result.lead.id ? result.lead : item))
      void refreshLeads()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not convert the lead.')
    }
  }

  return (
    <section className="pt-6">
      <PipelineSummary counts={summary} />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Pipeline</h2>
        <span className="text-xs font-mono bg-accent px-2 py-1 rounded text-accent-foreground">Realtime: {realtime}</span>
      </div>

      <form onSubmit={handleCreate} className="mb-8 grid gap-4 border border-border bg-card p-6 rounded-lg sm:grid-cols-2 lg:grid-cols-6 items-end">
        <Input aria-label="First name" placeholder="First name" required maxLength={100} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} label="First Name" />
        <Input aria-label="Last name" placeholder="Last name" required maxLength={100} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} label="Last Name" />
        <Input aria-label="Email" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} label="Email" />
        <Input aria-label="Phone" placeholder="Phone" type="tel" required minLength={7} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} label="Phone" />
        <Input aria-label="Lead source" placeholder="Source" required maxLength={120} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} label="Source" />
        {user?.role === 'PLATFORM_ADMIN' && (
          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-foreground">Brokerage</label>
            <select required value={form.brokerageId} onChange={(e) => setForm({ ...form, brokerageId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                {brokerages.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <Button disabled={submitting} type="submit" className="w-full">
          {submitting ? 'Adding…' : 'Add lead'}
        </Button>
      </form>

      {error && <p role="alert" className="mb-5 border-l-2 border-[#c64e3d] bg-white/60 px-4 py-3 text-sm text-[#9f392d]">{error}</p>}
      {loadingLeads ? <p className="py-8 text-sm text-[#687269]">Loading pipeline…</p> : (
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1080px] grid-cols-6 gap-3">
            {LEAD_STATUSES.map((status) => {
              const stageLeads = leads.filter((lead) => lead.status === status)
              return (
                <section key={status} aria-label={`${statusLabels[status]} leads`} className="min-h-48 border border-border bg-card p-3 rounded-lg shadow-sm">
                  <header className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase text-foreground">{statusLabels[status]}</h3>
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </header>
                  <div className="space-y-3">
                    {stageLeads.map((lead) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onConvert={handleConvert} 
                        onAssignment={handleAssignment} 
                        onStatusChange={handleStatusChange} 
                        advisors={advisors.filter(a => a.brokerageId === lead.brokerageId)} 
                        userRole={user?.role}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
