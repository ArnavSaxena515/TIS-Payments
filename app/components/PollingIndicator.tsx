import { Loader2 } from 'lucide-react'

export function PollingIndicator({ message, elapsed }: { message: string; elapsed?: number }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-navy-600">
      <Loader2 size={14} className="animate-spin text-accent" />
      <span>{message}</span>
      {elapsed !== undefined && (
        <span className="font-mono text-xs text-navy-400 tabular-nums">{elapsed}s</span>
      )}
    </div>
  )
}
