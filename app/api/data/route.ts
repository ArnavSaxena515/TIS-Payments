import { NextResponse } from 'next/server'
import { readBatches, readReconciliations } from '@/app/lib/store'
import { sumByCurrency } from '@/app/lib/formatters'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const [batches, reconciliations] = await Promise.all([readBatches(), readReconciliations()])
  const allTxns = batches.flatMap((b) => b.transactions)
  const totalReconciliationEntries = reconciliations.reduce((n, r) => n + r.entries.length, 0)
  const stats = {
    totalBatches: batches.length,
    totalTransactions: allTxns.length,
    executedBatches: batches.filter((b) => b.status === 'executed').length,
    totalReconciliations: reconciliations.length,
    totalReconciliationEntries,
    totalValueByCurrency: sumByCurrency(allTxns),
  }
  return NextResponse.json({ batches, reconciliations, stats })
}
