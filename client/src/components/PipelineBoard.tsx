import { useEffect, useState, type FormEvent } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../auth/useAuth'
import {
  createLeadRequest,
  convertLead,
  fetchLeadAdvisors,
  fetchLeadBrokerages,
  fetchLeads,
  updateLeadAssignment,
  updateLeadStatus,
} from '../services/leads'
import { LEAD_STATUSES, type Lead, type LeadAdvisor, type LeadBrokerage, type LeadStatus } from '../types/lead'
import { PipelineSummary } from './PipelineSummary'

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
  const { token, user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [advisors, setAdvisors] = useState<LeadAdvisor[]>([])
  const [brokerages, setBrokerages] = useState<LeadBrokerage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversionCredentials, setConversionCredentials] = useState<Record<string, { email: string; password: string }>>({})
  const [realtime, setRealtime] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', source: 'Website', brokerageId: '' })

  async function refreshLeads() {
    if (!token) return
    const result = await fetchLeads(token)
    setLeads(result)
  }

  useEffect(() => {
    if (!token) return
    let active = true
    Promise.all([fetchLeads(token), fetchLeadAdvisors(token), fetchLeadBrokerages(token)])
      .then(([loadedLeads, loadedAdvisors, loadedBrokerages]) => {
        if (!active) return
        setLeads(loadedLeads)
        setAdvisors(loadedAdvisors)
        setBrokerages(loadedBrokerages)
        setForm((current) => ({ ...current, brokerageId: current.brokerageId || loadedBrokerages[0]?._id || '' }))
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load the pipeline.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const socket = io(apiUrl, { auth: { token } })
    socket.on('connect', () => {
        setRealtime('connected')
        void refreshLeads()
    })
    socket.on('disconnect', () => setRealtime('disconnected'))
    socket.on('connect_error', () => setRealtime('disconnected'))
    socket.on('pipeline:update', () => {
      void refreshLeads()
    })

    return () => {
      active = false
      socket.disconnect()
    }
  }, [token])

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
      setConversionCredentials((current) => ({
        ...current,
        [lead.id]: { email: result.client.email, password: result.temporaryPassword },
      }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not convert the lead.')
    }
  }

  return (
    <section className="border-t border-[#d5d8ce] pt-10">
      <PipelineSummary leads={leads} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 font-mono text-xs uppercase text-[#9b583b]">Lead management</p>
          <h2 className="text-2xl font-semibold tracking-tight">Pipeline</h2>
        </div>
        <span className="font-mono text-xs uppercase text-[#718073]">Realtime {realtime}</span>
      </div>

      <form onSubmit={handleCreate} className="mb-8 grid gap-3 border-t-2 border-[#26372d] bg-white/70 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <input aria-label="First name" placeholder="First name" required maxLength={100} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm" />
        <input aria-label="Last name" placeholder="Last name" required maxLength={100} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm" />
        <input aria-label="Email" placeholder="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm" />
        <input aria-label="Phone" placeholder="Phone" type="tel" required minLength={7} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm" />
        <input aria-label="Lead source" placeholder="Source" required maxLength={120} value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm" />
        {user?.role === 'PLATFORM_ADMIN' && (
          <select aria-label="Brokerage" required value={form.brokerageId} onChange={(event) => setForm({ ...form, brokerageId: event.target.value })} className="min-w-0 border border-[#cbd0c7] bg-white px-3 py-2 text-sm">
            {brokerages.map((brokerage) => <option key={brokerage._id} value={brokerage._id}>{brokerage.name}</option>)}
          </select>
        )}
        <button disabled={submitting} className="bg-[#26372d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3c5545] disabled:opacity-60 lg:col-span-1" type="submit">
          {submitting ? 'Adding…' : 'Add lead'}
        </button>
      </form>

      {error && <p role="alert" className="mb-5 border-l-2 border-[#c64e3d] bg-white/60 px-4 py-3 text-sm text-[#9f392d]">{error}</p>}
      {loading ? <p className="py-8 text-sm text-[#687269]">Loading pipeline…</p> : (
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1080px] grid-cols-6 gap-3">
            {LEAD_STATUSES.map((status) => {
              const stageLeads = leads.filter((lead) => lead.status === status)
              return (
                <section key={status} aria-label={`${statusLabels[status]} leads`} className="min-h-48 border-t-2 border-[#26372d] bg-[#e9e9e1]/70 p-3">
                  <header className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase">{statusLabels[status]}</h3>
                    <span className="font-mono text-xs text-[#718073]">{stageLeads.length}</span>
                  </header>
                  <div className="space-y-3">
                    {stageLeads.map((lead) => {
                      const leadAdvisors = advisors.filter((advisor) => advisor.brokerageId === lead.brokerageId)
                      return (
                        <article key={lead.id} className="border border-[#d5d8ce] bg-white p-3">
                          <h4 className="break-words text-sm font-semibold">{lead.firstName} {lead.lastName}</h4>
                          <p className="mt-2 break-all text-xs text-[#687269]">{lead.email}</p>
                          <p className="mt-1 text-xs text-[#687269]">{lead.phone}</p>
                          <p className="mt-2 font-mono text-[11px] uppercase text-[#9b583b]">{lead.source}</p>
                          {lead.convertedCaseId && (
                            <p className="mt-2 text-xs font-semibold text-[#376447]">Converted to client</p>
                          )}
                          {!lead.convertedCaseId && (user?.role === 'BROKERAGE_ADMIN' || user?.role === 'ADVISOR') && (
                            <button type="button" onClick={() => void handleConvert(lead)} className="mt-3 w-full border border-[#52695a] px-2 py-1.5 text-xs font-semibold text-[#26372d] hover:bg-[#f3f2ec]">
                              Convert to client
                            </button>
                          )}
                          {conversionCredentials[lead.id] && (
                            <div className="mt-3 border-l-2 border-[#d6a34b] pl-2 text-[11px] leading-5 text-[#76613b]">
                              <p>Client account created. Share this temporary password securely; it is shown once.</p>
                              <p className="break-all font-mono">{conversionCredentials[lead.id].email}</p>
                              <p className="break-all font-mono">{conversionCredentials[lead.id].password}</p>
                            </div>
                          )}
                          {user?.role === 'PLATFORM_ADMIN' && <p className="mt-1 text-xs text-[#687269]">{brokerages.find((item) => item._id === lead.brokerageId)?.name ?? 'Brokerage'}</p>}
                          <label className="mt-3 block text-[11px] text-[#687269]">
                            Advisor
                            <select aria-label={`Advisor for ${lead.firstName} ${lead.lastName}`} value={lead.assignedAdvisorId ?? ''} onChange={(event) => void handleAssignment(lead.id, event.target.value)} className="mt-1 block w-full min-w-0 border border-[#cbd0c7] bg-white px-2 py-1.5 text-xs">
                              <option value="">Unassigned</option>
                              {leadAdvisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
                            </select>
                          </label>
                          <label className="mt-2 block text-[11px] text-[#687269]">
                            Move to
                            <select aria-label={`Status for ${lead.firstName} ${lead.lastName}`} value={lead.status} onChange={(event) => void handleStatusChange(lead, event.target.value as LeadStatus)} className="mt-1 block w-full min-w-0 border border-[#cbd0c7] bg-white px-2 py-1.5 text-xs">
                              {LEAD_STATUSES.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}
                            </select>
                          </label>
                        </article>
                      )
                    })}
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