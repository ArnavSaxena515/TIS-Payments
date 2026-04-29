'use client'

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { Toast as ToastT } from '../hooks/useTriggerAndPoll'

export function Toast({ toast, onDismiss }: { toast: ToastT; onDismiss: () => void }) {
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info
  const color =
    toast.type === 'success' ? 'border-accent text-accent-dark' :
    toast.type === 'error' ? 'border-rose-300 text-rose-700' :
    'border-navy-200 text-navy-700'
  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm bg-white border ${color} shadow-card`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <div className="font-medium">{toast.message}</div>
          {toast.detail && <div className="text-xs text-navy-500 mt-1 font-mono break-all">{toast.detail}</div>}
        </div>
        <button onClick={onDismiss} className="text-navy-400 hover:text-navy-900"><X size={14} /></button>
      </div>
    </div>
  )
}
