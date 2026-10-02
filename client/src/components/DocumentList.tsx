import type { ClientDocument } from '../types/documents'

interface DocumentListProps {
  documents: ClientDocument[]
  onDownload: (document: ClientDocument) => void
  onRetry: (document: ClientDocument) => void
  busyDocumentId?: string | null
}

const statusColors: Record<ClientDocument['verificationStatus'], string> = {
  UPLOADED: 'text-amber-500',
  CHECKING: 'text-blue-500',
  VERIFIED: 'text-green-500',
  FAILED: 'text-destructive',
}

export function DocumentList({ documents, onDownload, onRetry, busyDocumentId }: DocumentListProps) {
  if (documents.length === 0) return <p className="py-3 text-sm text-muted-foreground">No documents uploaded.</p>

  return (
    <ul className="divide-y divide-border">
      {documents.map((document) => (
        <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="break-all text-sm font-medium text-foreground">{document.originalFileName}</p>
            <p className="mt-1 font-mono text-[11px] uppercase text-muted-foreground">
              {document.documentType.replaceAll('_', ' ')} · {(document.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className={`mt-1 text-xs font-semibold ${statusColors[document.verificationStatus]}`}>
              {document.verificationStatus}{document.verificationAttempts > 0 ? ` · ${document.verificationAttempts} checks` : ''}
            </p>
            {document.verificationError && <p className="mt-1 max-w-xl text-xs text-destructive">{document.verificationError}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => onDownload(document)} className="border border-border px-3 py-2 text-xs font-medium hover:bg-accent text-foreground">
              Download
            </button>
            {document.verificationStatus === 'FAILED' && (
              <button type="button" disabled={busyDocumentId === document.id} onClick={() => onRetry(document)} className="border border-border px-3 py-2 text-xs font-medium hover:bg-accent text-foreground disabled:opacity-50">
                {busyDocumentId === document.id ? 'Queueing…' : 'Retry check'}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}