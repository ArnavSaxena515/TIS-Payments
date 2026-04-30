'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function ResetModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false)

  const onConfirm = async () => {
    setBusy(true)
    try {
      await fetch('/api/reset', { method: 'POST' })
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-4">
      <div className="bg-white border border-navy-100 max-w-md w-full">
        <div className="flex items-center justify-between px-5 py-3 border-b border-navy-100">
          <h2 className="font-serif text-lg text-navy-900">Refresh data</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-900"><X size={16} /></button>
        </div>
        <div className="px-5 py-5 text-sm text-navy-600">
          This permanently clears all received payment batches and reconciliation statements.
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-navy-100 bg-navy-50">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-navy-200 text-navy-700 hover:bg-white">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-3 py-1.5 text-sm bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}
