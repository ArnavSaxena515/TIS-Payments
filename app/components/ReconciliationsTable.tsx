'use client'

import type { ReconciliationStatement } from '../lib/types'
import { formatRelative, formatAmount } from '../lib/formatters'

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function ReconciliationsTable({
  reconciliations,
  newId,
  onSelect,
}: {
  reconciliations: ReconciliationStatement[]
  newId?: string | null
  onSelect: (r: ReconciliationStatement) => void
}) {
  return (
    <div className="bg-white border border-navy-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-navy-50 border-b border-navy-100">
          <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-navy-500">
            <th className="px-4 py-2.5 font-medium">Statement ID</th>
            <th className="px-4 py-2.5 font-medium">Message ID</th>
            <th className="px-4 py-2.5 font-medium">Received</th>
            <th className="px-4 py-2.5 font-medium">Account</th>
            <th className="px-4 py-2.5 font-medium text-right">Entries</th>
            <th className="px-4 py-2.5 font-medium text-right">Closing Balance</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium" />
          </tr>
        </thead>
        <tbody>
          {reconciliations.map((r) => {
            const isNew = r.reconciliationId === newId
            const acct = r.accountId || r.accountCurrency
              ? `${r.accountId || '—'}${r.accountCurrency ? ` · ${r.accountCurrency}` : ''}`
              : '—'
            return (
              <tr
                key={r.reconciliationId}
                onClick={() => onSelect(r)}
                className={`border-b border-navy-50 last:border-0 hover:bg-navy-50/40 transition-colors cursor-pointer ${isNew ? 'row-new' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-navy-900">{truncate(r.statementId || '—', 24)}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-navy-500">{truncate(r.messageId || '—', 24)}</td>
                <td className="px-4 py-3 text-navy-500 text-xs">{formatRelative(r.receivedAt)}</td>
                <td className="px-4 py-3 text-navy-700 text-xs font-mono">{acct}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{r.entries.length}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {r.closingBalance
                    ? <>
                        {formatAmount(r.closingBalance.amount)}{' '}
                        <span className="text-navy-400">{r.closingBalance.currency}</span>{' '}
                        <span className={`text-[10px] ${r.closingBalance.indicator === 'DBIT' ? 'text-rose-700' : 'text-accent-dark'}`}>
                          {r.closingBalance.indicator}
                        </span>
                      </>
                    : <span className="text-navy-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-sm font-medium bg-accent/10 text-accent-dark border-accent/40">
                    Generated
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-accent-dark hover:underline">View</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
