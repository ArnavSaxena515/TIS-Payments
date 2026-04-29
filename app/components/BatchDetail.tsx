'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Play } from 'lucide-react'
import type { PaymentBatch } from '../lib/types'
import { formatAmount, formatDateTime } from '../lib/formatters'
import { StatusBadge } from './StatusBadge'
import { CurrencyAmount } from './CurrencyAmount'

export function BatchDetail({ initial }: { initial: PaymentBatch }) {
  const [batch, setBatch] = useState(initial)
  const [showXml, setShowXml] = useState(false)
  const [executing, setExecuting] = useState(false)

  const onExecute = async () => {
    setExecuting(true)
    try {
      const res = await fetch(`/api/batches/${batch.batchId}/execute`, { method: 'POST' })
      if (res.ok) {
        const d = await res.json()
        setBatch({
          ...batch,
          status: 'executed',
          executedAt: d.executedAt,
          transactions: batch.transactions.map((t) => ({ ...t, status: 'executed', executedAt: d.executedAt })),
        })
      }
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <nav className="text-xs text-navy-400 flex items-center gap-1.5 font-mono">
        <Link href="/" className="hover:text-navy-900">Inbound Batches</Link>
        <ChevronRight size={12} />
        <span className="text-navy-700">{batch.messageId}</span>
      </nav>

      <header className="bg-white border border-navy-100 px-6 py-5 flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl text-navy-900">{batch.messageId}</h1>
            <StatusBadge status={batch.status} />
          </div>
          <div className="text-sm text-navy-500">
            Received {formatDateTime(batch.receivedAt)}
            {batch.executedAt && <> · Executed {formatDateTime(batch.executedAt)}</>}
          </div>
        </div>
        {batch.status === 'received' && (
          <button
            onClick={onExecute}
            disabled={executing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-navy-900 bg-navy-900 text-white text-sm hover:bg-navy-800 disabled:opacity-60"
          >
            <Play size={14} />
            {executing ? 'Executing…' : 'Execute Batch'}
          </button>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-px bg-navy-100 border border-navy-100">
        <Card title="Group Header">
          <Field label="Creation Date/Time" value={formatDateTime(batch.creationDateTime)} mono />
          <Field label="Number of Transactions" value={String(batch.numberOfTransactions)} mono />
          <Field label="Control Sum" value={`${formatAmount(batch.controlSum)} ${batch.debtorCurrency}`} mono />
          <Field label="Initiating Party" value={batch.initiatingPartyName} />
          {batch.initiatingPartyId && <Field label="Initiating Party ID" value={batch.initiatingPartyId} mono />}
        </Card>
        <Card title="Payment Information">
          <Field label="Payment Info ID" value={batch.paymentInfoId} mono />
          <Field label="Payment Method" value={batch.paymentMethod} />
          <Field label="Requested Execution Date" value={batch.requestedExecutionDate} mono />
          <Field label="Debtor" value={`${batch.debtorName}${batch.debtorCountry ? ` (${batch.debtorCountry})` : ''}`} />
          <Field label="Debtor Account" value={batch.debtorAccount} mono />
          <Field label="Debtor Currency" value={batch.debtorCurrency} mono />
        </Card>
      </div>

      <section>
        <h2 className="font-serif text-xl text-navy-900 mb-3">Transactions ({batch.transactions.length})</h2>
        <div className="bg-white border border-navy-100 overflow-x-auto scroll-mono">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-navy-100">
              <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-navy-500">
                <th className="px-4 py-2.5 font-medium">End-to-End ID</th>
                <th className="px-4 py-2.5 font-medium">Creditor</th>
                <th className="px-4 py-2.5 font-medium">Bank</th>
                <th className="px-4 py-2.5 font-medium">Account</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium">Remittance</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {batch.transactions.map((t) => (
                <tr key={t.endToEndId} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-navy-900 whitespace-nowrap">{t.endToEndId}</td>
                  <td className="px-4 py-3 text-navy-700">{t.creditorName}</td>
                  <td className="px-4 py-3 text-navy-600">
                    <div className="font-mono text-xs">{t.creditorBic}</div>
                    {t.creditorBankName && <div className="text-xs text-navy-400">{t.creditorBankName}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-600">
                    {t.creditorIban ? t.creditorIban : t.creditorAccount ? `Acct: ${t.creditorAccount}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <CurrencyAmount amount={t.amount} currency={t.currency} />
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-500">{t.remittanceInfo ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-navy-100">
        <button
          onClick={() => setShowXml((s) => !s)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-navy-700 hover:bg-navy-50"
        >
          <span className="flex items-center gap-2">
            {showXml ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            View raw pain.001 XML
          </span>
          <span className="text-xs text-navy-400 font-mono">{batch.rawXml.length} chars</span>
        </button>
        {showXml && (
          <pre className="border-t border-navy-100 bg-navy-50 px-5 py-4 text-xs font-mono text-navy-800 overflow-x-auto scroll-mono whitespace-pre">
            {batch.rawXml}
          </pre>
        )}
      </section>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white px-6 py-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400 mb-3">{title}</div>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <dt className="w-44 shrink-0 text-navy-400 text-xs">{label}</dt>
      <dd className={`text-navy-900 ${mono ? 'font-mono text-xs tabular-nums' : ''}`}>{value}</dd>
    </div>
  )
}
