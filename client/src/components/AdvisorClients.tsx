import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../auth/useAuth'
import { DocumentList } from './DocumentList'
import { fetchCaseDocuments, fetchClients, getDocumentDownloadUrl, retryDocument } from '../services/cases'
import type { ClientDocument, ClientWithCases } from '../types/documents'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

interface ClientView extends ClientWithCases {
  documentsByCase: Record<string, ClientDocument[]>
}

export function AdvisorClients() {
  const { token, user } = useAuth()
  const [clients, setClients] = useState<ClientView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    const refresh = async () => {
      const records = await fetchClients(token)
      const withDocuments = await Promise.all(records.map(async (client) => {
        const documentsByCase = Object.fromEntries(await Promise.all(client.cases.map(async (clientCase) => [
          clientCase.id,
          await fetchCaseDocuments(token, clientCase.id),
        ] as const)))
        return { ...client, documentsByCase }
      }))
      if (active) setClients(withDocuments)
    }
    void refresh()
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load brokerage clients.') })
      .finally(() => { if (active) setLoading(false) })

    const socket = io(apiUrl, { auth: { token } })
    socket.on('document:update', () => {
      void refresh().catch(() => setError('Could not refresh document status.'))
    })
    return () => {
      active = false
      socket.disconnect()
    }
  }, [token])

  async function handleDownload(document: ClientDocument) {
    if (!token) return
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    try {
      const url = await getDocumentDownloadUrl(token, document.id)
      if (tab) tab.location.href = url
      else setError('Allow pop-ups to download documents.')
    } catch (requestError) {
      tab?.close()
      setError(requestError instanceof Error ? requestError.message : 'Could not prepare the download.')
    }
  }

  async function handleRetry(document: ClientDocument) {
    if (!token) return
    setBusyDocumentId(document.id)
    try {
      await retryDocument(token, document.id)
      const refreshed = await fetchClients(token)
      const withDocuments = await Promise.all(refreshed.map(async (client) => ({
        ...client,
        documentsByCase: Object.fromEntries(await Promise.all(client.cases.map(async (clientCase) => [clientCase.id, await fetchCaseDocuments(token, clientCase.id)] as const))),
      })))
      setClients(withDocuments)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not retry verification.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  return (
    <section className="border-t border-[#d5d8ce] pt-10">
      <p className="mb-2 font-mono text-xs uppercase text-[#9b583b]">Brokerage workspace</p>
      <h2 className="text-2xl font-semibold tracking-tight">Clients and documents</h2>
      {user?.role === 'PLATFORM_ADMIN' && <p className="mt-2 text-xs text-[#687269]">Platform-wide client list</p>}
      {error && <p role="alert" className="mt-4 border-l-2 border-[#c64e3d] bg-white/60 px-4 py-3 text-sm text-[#9f392d]">{error}</p>}
      {loading ? <p className="py-6 text-sm text-[#687269]">Loading clients…</p> : clients.length === 0 ? (
        <p className="mt-5 bg-white/70 p-5 text-sm text-[#687269]">No client accounts in this scope yet.</p>
      ) : (
        <div className="mt-5 space-y-5">
          {clients.map((client) => (
            <article key={client.id} className="border-t-2 border-[#26372d] bg-white/70 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold">{client.name}</h3>
                <span className="text-sm text-[#687269]">{client.email}</span>
              </div>
              {client.cases.map((clientCase) => (
                <section key={clientCase.id} className="mt-4 border-t border-[#e1e3dc] pt-4">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>Case · {clientCase.applicationStatus.replaceAll('_', ' ')}</span>
                    <span className="text-[#687269]">Advisor: {clientCase.advisorName ?? 'Not assigned'}</span>
                  </div>
                  <DocumentList documents={client.documentsByCase[clientCase.id] ?? []} onDownload={(document) => void handleDownload(document)} onRetry={(document) => void handleRetry(document)} busyDocumentId={busyDocumentId} />
                </section>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}