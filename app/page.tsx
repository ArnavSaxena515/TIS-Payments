'use client'

import useSWR from 'swr'
import { useEffect, useRef, useState } from 'react'
import { ReceiveBatchButton } from './components/ReceiveBatchButton'
import { PollingIndicator } from './components/PollingIndicator'
import { BatchTable } from './components/BatchTable'
import { StatsRow } from './components/StatsRow'
import { EmptyState } from './components/EmptyState'
import { LoadingState } from './components/LoadingState'
import { Toast } from './components/Toast'
import { OutboundReconciliationSection } from './components/OutboundReconciliationSection'
import { useTriggerAndPoll, pollingMessage } from './hooks/useTriggerAndPoll'
import type { PaymentBatch, BatchStats, ReconciliationStatement } from './lib/types'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => r.json())

export default function Dashboard() {
  const { data, mutate, isLoading } = useSWR<{ batches: PaymentBatch[]; reconciliations: ReconciliationStatement[]; stats: BatchStats }>(
    '/api/data',
    fetcher,
    { refreshInterval: 5000 },
  )

  const [newBatchId, setNewBatchId] = useState<string | null>(null)
  const lastTopRef = useRef<string | null>(null)

  useEffect(() => {
    const top = data?.batches?.[0]?.batchId ?? null
    if (top && top !== lastTopRef.current && lastTopRef.current !== null) {
      setNewBatchId(top)
      const t = setTimeout(() => setNewBatchId(null), 3500)
      return () => clearTimeout(t)
    }
    lastTopRef.current = top
  }, [data?.batches])

  const { state, elapsed, toast, trigger, dismissToast } = useTriggerAndPoll({
    onCompleted: async () => { await mutate() },
  })

  const batches = data?.batches ?? []
  const reconciliations = data?.reconciliations ?? []
  const stats = data?.stats ?? { totalBatches: 0, totalTransactions: 0, executedBatches: 0, totalReconciliations: 0, totalReconciliationEntries: 0, totalValueByCurrency: {} }
  const executedBatchCount = batches.filter((b) => b.status === 'executed').length

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <section>
        <div className="text-[10px] uppercase tracking-[0.2em] text-accent-dark mb-2">
          Payment Hub · Inbound Batch Monitor
        </div>
        <h1 className="font-serif text-4xl text-navy-900 leading-tight mb-1">
          Inbound Payment Batches
        </h1>
        <p className="text-navy-500 text-sm max-w-2xl">
          ISO 20022 pain.001 batches received from corporate ERP via the connected workflow.
          Review, audit, and execute payment instructions before forwarding to bank rails.
        </p>
      </section>

      <StatsRow stats={stats} />

      <section className="bg-white border border-navy-100 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400">Demo Trigger</div>
          <div className="text-sm text-navy-600">Pull a fresh pain.001 batch from SAP via Refold workflow.</div>
        </div>
        <div className="flex items-center gap-4">
          {(state === 'polling' || state === 'triggering') && (
            <PollingIndicator
              message={state === 'triggering' ? 'Connecting to workflow…' : pollingMessage(elapsed)}
              elapsed={state === 'polling' ? elapsed : undefined}
            />
          )}
          <ReceiveBatchButton state={state} elapsed={elapsed} onClick={trigger} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl text-navy-900">Received batches</h2>
          <span className="text-xs text-navy-400 font-mono">
            {data ? `Last updated ${new Date().toLocaleTimeString()}` : ''}
          </span>
        </div>
        {isLoading && !data ? (
          <LoadingState />
        ) : batches.length === 0 ? (
          <EmptyState />
        ) : (
          <BatchTable batches={batches} newBatchId={newBatchId} />
        )}
      </section>

      <OutboundReconciliationSection
        reconciliations={reconciliations}
        executedBatchCount={executedBatchCount}
        refetch={mutate}
      />

      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </div>
  )
}
