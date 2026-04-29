type Status = 'received' | 'processing' | 'executed' | 'queued' | 'failed'

const styles: Record<Status, string> = {
  received: 'bg-navy-50 text-navy-700 border-navy-200',
  processing: 'bg-amber-50 text-amber-800 border-amber-200',
  executed: 'bg-accent/10 text-accent-dark border-accent/40',
  queued: 'bg-navy-50 text-navy-600 border-navy-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
}

const labels: Record<Status, string> = {
  received: 'Received',
  processing: 'Processing',
  executed: 'Executed',
  queued: 'Queued',
  failed: 'Failed',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-sm font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
