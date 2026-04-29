import { NextResponse } from 'next/server'
import { readBatches } from '@/app/lib/store'
import { sumByCurrency } from '@/app/lib/formatters'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const batches = await readBatches()
  const allTxns = batches.flatMap((b) => b.transactions)
  const stats = {
    totalBatches: batches.length,
    totalTransactions: allTxns.length,
    executedBatches: batches.filter((b) => b.status === 'executed').length,
    totalValueByCurrency: sumByCurrency(allTxns),
  }
  return NextResponse.json({ batches, stats })
}
