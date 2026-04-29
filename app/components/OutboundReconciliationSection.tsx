'use client'

import { useEffect, useRef, useState } from 'react'
import { FileCheck2 } from 'lucide-react'
import { ReceiveBatchButton } from './ReceiveBatchButton'
import { PollingIndicator } from './PollingIndicator'
import { Toast } from './Toast'
import { ReconciliationsTable } from './ReconciliationsTable'
import { ReconciliationDetailModal } from './ReconciliationDetailModal'
import { useTriggerAndPoll, reconciliationPollingMessage } from '../hooks/useTriggerAndPoll'
import type { ReconciliationStatement } from '../lib/types'

interface Props {
  reconciliations: ReconciliationStatement[]
  executedBatchCount: number
  refetch: () => Promise<any> | void
}

export function OutboundReconciliationSection({ reconciliations, executedBatchCount, refetch }: Props) {
  const [selected, setSelected] = useState<ReconciliationStatement | null>(null)
  const [newId, setNewId] = useState<string | null>(null)
  const lastTopRef = useRef<string | null>(null)

  useEffect(() => {
    const top = reconciliations[0]?.reconciliationId ?? null
    if (top && top !== lastTopRef.current && lastTopRef.current !== null) {
      setNewId(top)
      const t = setTimeout(() => setNewId(null), 3500)
      return () => clearTimeout(t)
    }
    lastTopRef.current = top
  }, [reconciliations])

  const baselineTopRef = useRef<string | null>(null)

  const { state, elapsed, toast, trigger: rawTrigger, dismissToast } = useTriggerAndPoll({
    triggerEndpoint: '/api/trigger-reconciliation',
    successMessage: 'Reconciliation statement received',
    triggerErrorMessage: 'Reconciliation trigger failed — check Refold connection',
    fastPollMs: 1500,
    onCompleted: async () => { await refetch() },
    completionCheck: async () => {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' })
        if (!res.ok) return false
        const d = await res.json()
        const top = d?.reconciliations?.[0]?.reconciliationId ?? null
        return Boolean(top && top !== baselineTopRef.current)
      } catch {
        return false
      }
    },
  })

  const trigger = () => {
    baselineTopRef.current = reconciliations[0]?.reconciliationId ?? null
    rawTrigger()
  }

  const buttonDisabled = executedBatchCount === 0
  const totalEntries = reconciliations.reduce((n, r) => n + r.entries.length, 0)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-accent-dark mb-1">
            End-of-Day · Outbound
          </div>
          <h2 className="font-serif text-2xl text-navy-900 leading-tight">Outbound Reconciliation</h2>
        </div>
        <div className="text-xs text-navy-500 font-mono">
          {reconciliations.length} statements · {totalEntries} entries
        </div>
      </div>

      <div className="bg-white border border-navy-100 px-5 py-4 flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400">End-of-Day Trigger</div>
          <div className="text-sm text-navy-600">
            Generate a consolidated camt.053 statement from executed batches.
          </div>
          {buttonDisabled && (
            <div className="text-xs text-navy-400 pt-0.5">
              Execute one or more inbound batches to enable reconciliation.
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {(state === 'polling' || state === 'triggering') && (
            <PollingIndicator
              message={state === 'triggering' ? 'Sending executed batches to workflow…' : reconciliationPollingMessage(elapsed)}
              elapsed={state === 'polling' ? elapsed : undefined}
            />
          )}
          <ReceiveBatchButton
            state={state}
            elapsed={elapsed}
            onClick={trigger}
            idleLabel="Generate End-of-Day Reconciliation"
            successLabel="Reconciliation statement received"
            triggeringLabel="Sending executed batches to workflow…"
            pollingMessageFn={reconciliationPollingMessage}
            icon={FileCheck2}
            disabled={buttonDisabled}
          />
        </div>
      </div>

      {reconciliations.length === 0 ? (
        <div className="border border-dashed border-navy-200 bg-white px-6 py-12 text-center">
          <FileCheck2 size={28} className="mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 text-sm">
            Reconciliation statements will appear here once a workflow run completes.
          </p>
        </div>
      ) : (
        <ReconciliationsTable
          reconciliations={reconciliations}
          newId={newId}
          onSelect={setSelected}
        />
      )}

      {selected && <ReconciliationDetailModal recon={selected} onClose={() => setSelected(null)} />}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </section>
  )
}
