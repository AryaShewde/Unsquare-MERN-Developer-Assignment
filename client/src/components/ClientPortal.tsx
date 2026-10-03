import { useEffect, useState, type FormEvent } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../auth/useAuth'
import { DocumentList } from './DocumentList'
import { fetchMyCases, fetchMyDocuments, getDocumentDownloadUrl, retryDocument, uploadDocument } from '../services/cases'
import type { ClientCaseSummary, ClientDocument } from '../types/documents'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function ClientPortal() {
  const { token, user } = useAuth()
  const [clientCase, setClientCase] = useState<ClientCaseSummary | null>(null)
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('IDENTITY')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    const refresh = async () => {
      const [cases, currentDocuments] = await Promise.all([fetchMyCases(token), fetchMyDocuments(token)])
      if (!active) return
      setClientCase(cases[0] ?? null)
      setDocuments(currentDocuments)
    }
    void refresh()
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load your case.')
      })
      .finally(() => { if (active) setLoading(false) })

    const isProduction = import.meta.env.PROD;
    let socket: any = null;

    if (!isProduction) {
      socket = io(apiUrl, { auth: { token } });
      socket.on('document:update', (event: { clientId?: string }) => {
        if (event.clientId === user?.id) {
          void fetchMyDocuments(token).then(setDocuments).catch(() => setError('Could not refresh document status.'))
        }
      });
    }

    return () => {
      active = false;
      if (socket) {
        socket.disconnect();
      }
    }
  }, [token, user?.id])

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!token || !file) return
    setError(null)
    setUploading(true)
    try {
      const document = await uploadDocument(token, file, documentType)
      setDocuments((current) => [document, ...current.filter((item) => item.id !== document.id)])
      setFile(null)
      const input = form.querySelector<HTMLInputElement>('input[type="file"]')
      if (input) input.value = ''
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The document could not be uploaded.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(document: ClientDocument) {
    if (!token) return
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    try {
      const url = await getDocumentDownloadUrl(token, document.id)
      if (tab) tab.location.href = url
      else setError('Allow pop-ups to download your document.')
    } catch (requestError) {
      tab?.close()
      setError(requestError instanceof Error ? requestError.message : 'Could not prepare the download.')
    }
  }

  async function handleRetry(document: ClientDocument) {
    if (!token) return
    setBusyDocumentId(document.id)
    try {
      const retried = await retryDocument(token, document.id)
      setDocuments((current) => current.map((item) => item.id === retried.id ? retried : item))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not retry verification.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  return (
    <section className="border-t border-[#d5d8ce] pt-10">
      <p className="mb-2 font-mono text-xs uppercase text-[#9b583b]">Client portal</p>
      <h2 className="text-2xl font-semibold tracking-tight">Your case</h2>
      {error && <p role="alert" className="mt-4 border-l-2 border-[#c64e3d] bg-white/60 px-4 py-3 text-sm text-[#9f392d]">{error}</p>}
      {loading ? <p className="py-6 text-sm text-[#687269]">Loading your case…</p> : !clientCase ? (
        <p className="mt-5 bg-white/70 p-5 text-sm text-[#687269]">No active case is linked to this account yet.</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 border-t-2 border-[#26372d] bg-white/70 p-5 sm:grid-cols-3">
            <div><p className="text-xs text-[#687269]">Application status</p><p className="mt-1 text-sm font-semibold">{clientCase.applicationStatus.replaceAll('_', ' ')}</p></div>
            <div><p className="text-xs text-[#687269]">Advisor</p><p className="mt-1 text-sm font-semibold">{clientCase.advisorName ?? 'Not assigned'}</p></div>
            <div><p className="text-xs text-[#687269]">Opened</p><p className="mt-1 text-sm font-semibold">{new Date(clientCase.createdAt).toLocaleDateString()}</p></div>
          </div>
          <form onSubmit={handleUpload} className="mt-6 grid gap-3 border-t border-[#d5d8ce] bg-white/60 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <label className="block text-xs font-medium text-[#687269]">Document file (PDF/JPEG/PNG, max 10 MB)
              <input type="file" accept="application/pdf,image/jpeg,image/png" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm file:mr-3 file:border-0 file:bg-[#26372d] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
            </label>
            <label className="block text-xs font-medium text-[#687269]">Document type
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="mt-2 block w-full border border-[#cbd0c7] bg-white px-3 py-2 text-sm">
                <option value="IDENTITY">Identity</option><option value="INCOME">Income</option><option value="BANK_STATEMENT">Bank statement</option><option value="OTHER">Other</option>
              </select>
            </label>
            <button type="submit" disabled={!file || uploading} className="bg-[#26372d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3c5545] disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Upload document'}
            </button>
          </form>
          <div className="mt-6 border-t border-[#d5d8ce] pt-4">
            <div className="mb-2 flex items-baseline justify-between"><h3 className="text-sm font-semibold">Your documents</h3><span className="font-mono text-[11px] uppercase text-[#718073]">Live status</span></div>
            <DocumentList documents={documents} onDownload={(document) => void handleDownload(document)} onRetry={(document) => void handleRetry(document)} busyDocumentId={busyDocumentId} />
          </div>
        </>
      )}
    </section>
  )
}