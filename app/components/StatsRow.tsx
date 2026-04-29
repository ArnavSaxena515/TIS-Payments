import type { BatchStats } from '../lib/types'
import { formatAmount } from '../lib/formatters'

export function StatsRow({ stats }: { stats: BatchStats }) {
  const currencies = Object.entries(stats.totalValueByCurrency)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-navy-100 border border-navy-100 rounded-sm overflow-hidden">
      <Stat label="Inbound Batches" value={String(stats.totalBatches)} />
      <Stat label="Transactions" value={String(stats.totalTransactions)} />
      <Stat label="Executed Batches" value={String(stats.executedBatches)} />
      <div className="bg-white px-5 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400 mb-2">Total Value</div>
        {currencies.length === 0 ? (
          <div className="text-navy-300 text-sm">—</div>
        ) : (
          <div className="space-y-0.5">
            {currencies.map(([ccy, amt]) => (
              <div key={ccy} className="flex justify-between gap-3 text-sm font-mono tabular-nums">
                <span className="text-navy-400">{ccy}</span>
                <span className="text-navy-900">{formatAmount(amt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400 mb-2">{label}</div>
      <div className="font-serif text-3xl text-navy-900 leading-none">{value}</div>
    </div>
  )
}
