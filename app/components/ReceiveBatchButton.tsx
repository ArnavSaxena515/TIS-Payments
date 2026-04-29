'use client'

import { ArrowDownToLine, Loader2, FileCheck2, type LucideIcon } from 'lucide-react'
import { TriggerState, pollingMessage } from '../hooks/useTriggerAndPoll'

interface Props {
  state: TriggerState
  elapsed: number
  onClick: () => void
  idleLabel?: string
  successLabel?: string
  triggeringLabel?: string
  pollingMessageFn?: (elapsed: number) => string
  icon?: LucideIcon
  disabled?: boolean
}

export function ReceiveBatchButton({
  state,
  elapsed,
  onClick,
  idleLabel = 'Receive Batch from Corporate ERP',
  successLabel = 'Payment batch received',
  triggeringLabel = 'Connecting to workflow…',
  pollingMessageFn = pollingMessage,
  icon: Icon = ArrowDownToLine,
  disabled: forceDisabled = false,
}: Props) {
  const busy = state === 'triggering' || state === 'polling'
  const disabled = forceDisabled || busy

  let label = idleLabel
  if (state === 'triggering') label = triggeringLabel
  else if (state === 'polling') label = pollingMessageFn(elapsed)
  else if (state === 'success') label = successLabel

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center gap-3 px-5 py-3 border text-sm font-medium tracking-wide transition-colors
        ${disabled
          ? 'border-navy-200 bg-navy-50 text-navy-400 cursor-not-allowed'
          : state === 'success'
            ? 'border-accent bg-accent/10 text-accent-dark'
            : 'border-navy-900 bg-navy-900 text-white hover:bg-navy-800'}`}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      <span>{label}</span>
      {state === 'polling' && (
        <span className="font-mono text-xs tabular-nums opacity-70 ml-1">{elapsed}s</span>
      )}
    </button>
  )
}

export { FileCheck2 }
