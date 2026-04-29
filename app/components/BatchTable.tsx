'use client'

import Link from 'next/link'
import type { PaymentBatch } from '../lib/types'
import { formatRelative, formatAmount } from '../lib/formatters'
import { StatusBadge } from './StatusBadge'

export function BatchTable({ batches, newBatchId }: { batches: PaymentBatch[]; newBatchId?: string | null }) {
  return (
    <div className="bg-white border border-navy-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-navy-50 border-b border-navy-100">
          <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-navy-500">
            <th className="px-4 py-2.5 font-medium">Message ID</th>
            <th className="px-4 py-2.5 font-medium">Initiating Party</th>
            <th className="px-4 py-2.5 font-medium">Received</th>
            <th className="px-4 py-2.5 font-medium text-right">Txns</th>
            <th className="px-4 py-2.5 font-medium text-right">Control Sum</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => {
            const isNew = b.batchId === newBatchId
            return (
              <tr
                key={b.batchId}
                className={`border-b border-navy-50 last:border-0 hover:bg-navy-50/40 transition-colors ${isNew ? 'row-new' : ''}`}
              >
                <td className="px-4 py-3">
                  <Link href={`/batches/${b.batchId}`} className="font-mono text-xs text-navy-900 hover:text-accent-dark">
                    {b.messageId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy-700">{b.initiatingPartyName}</td>
                <td className="px-4 py-3 text-navy-500 text-xs">{formatRelative(b.receivedAt)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.numberOfTransactions}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {formatAmount(b.controlSum)} <span className="text-navy-400">{b.debtorCurrency}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
