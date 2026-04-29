'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import type { ReconciliationStatement } from '../lib/types'
import { formatAmount, formatDateTime } from '../lib/formatters'
import { formatXml } from '../lib/xml-format'
import { CurrencyAmount } from './CurrencyAmount'

export function ReconciliationDetailModal({ recon, onClose }: { recon: ReconciliationStatement; onClose: () => void }) {
  const [showXml, setShowXml] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/40 px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div
        className="max-w-5xl mx-auto bg-white border border-navy-100 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <div>
            <div className="font-serif text-xl text-navy-900">{recon.statementId || '—'}</div>
            <div className="text-xs text-navy-500 mt-1 font-mono">
              {recon.messageId || '—'} · received {formatDateTime(recon.receivedAt)}
            </div>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-900"><X size={18} /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-navy-100">
          <Card title="Account">
            <Field label="Account ID" value={recon.accountId || '—'} mono />
            <Field label="Currency" value={recon.accountCurrency || '—'} mono />
            {recon.accountOwner && <Field label="Owner" value={recon.accountOwner} />}
          </Card>
          <Card title="Statement">
            <Field label="Created" value={recon.statementCreatedAt ? formatDateTime(recon.statementCreatedAt) : '—'} mono />
            <Field label="Period From" value={recon.fromDate ? formatDateTime(recon.fromDate) : '—'} mono />
            <Field label="Period To" value={recon.toDate ? formatDateTime(recon.toDate) : '—'} mono />
            {recon.openingBalance && (
              <Field
                label="Opening Balance"
                value={`${formatAmount(recon.openingBalance.amount)} ${recon.openingBalance.currency} (${recon.openingBalance.indicator})`}
                mono
              />
            )}
            {recon.closingBalance && (
              <Field
                label="Closing Balance"
                value={`${formatAmount(recon.closingBalance.amount)} ${recon.closingBalance.currency} (${recon.closingBalance.indicator})`}
                mono
              />
            )}
          </Card>
        </div>

        <div className="px-6 py-5 border-t border-navy-100">
          <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400 mb-3">
            Entries ({recon.entries.length})
          </div>
          {recon.entries.length === 0 ? (
            <div className="text-sm text-navy-400 py-4 text-center border border-dashed border-navy-200">
              No entries in this statement.
            </div>
          ) : (
            <div className="border border-navy-100 overflow-x-auto scroll-mono">
              <table className="w-full text-sm">
                <thead className="bg-navy-50 border-b border-navy-100">
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-navy-500">
                    <th className="px-3 py-2.5 font-medium">End-to-End ID</th>
                    <th className="px-3 py-2.5 font-medium text-right">Amount</th>
                    <th className="px-3 py-2.5 font-medium">Ind.</th>
                    <th className="px-3 py-2.5 font-medium">Booking</th>
                    <th className="px-3 py-2.5 font-medium">Creditor</th>
                    <th className="px-3 py-2.5 font-medium">BIC</th>
                    <th className="px-3 py-2.5 font-medium">Remittance</th>
                  </tr>
                </thead>
                <tbody>
                  {recon.entries.map((e, i) => (
                    <tr key={`${e.endToEndId}-${i}`} className="border-b border-navy-50 last:border-0">
                      <td className="px-3 py-2.5 font-mono text-xs text-navy-900 whitespace-nowrap">{e.endToEndId || '—'}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <CurrencyAmount amount={e.amount} currency={e.currency} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-sm
                          ${e.creditDebitIndicator === 'DBIT' ? 'border-rose-200 text-rose-700 bg-rose-50' : 'border-accent/40 text-accent-dark bg-accent/10'}`}>
                          {e.creditDebitIndicator}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-navy-600 font-mono">{e.bookingDate ?? '—'}</td>
                      <td className="px-3 py-2.5 text-navy-700">{e.creditorName ?? '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-navy-600">{e.creditorBic ?? '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-navy-500">{e.remittanceInfo ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-navy-100">
          <button
            onClick={() => setShowXml((s) => !s)}
            className="w-full flex items-center justify-between px-6 py-3 text-sm text-navy-700 hover:bg-navy-50"
          >
            <span className="flex items-center gap-2">
              {showXml ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              View raw camt.053 XML
            </span>
            <span className="text-xs text-navy-400 font-mono">{recon.rawXml.length} chars</span>
          </button>
          {showXml && (
            <pre className="border-t border-navy-100 bg-navy-50 px-6 py-4 text-xs font-mono text-navy-800 overflow-x-auto scroll-mono whitespace-pre leading-relaxed max-h-[60vh]">
              {formatXml(recon.rawXml)}
            </pre>
          )}
        </div>
      </div>
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
      <dt className="w-40 shrink-0 text-navy-400 text-xs">{label}</dt>
      <dd className={`text-navy-900 ${mono ? 'font-mono text-xs tabular-nums' : ''}`}>{value}</dd>
    </div>
  )
}
