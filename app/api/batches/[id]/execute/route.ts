import { NextResponse } from 'next/server'
import { readBatches, writeBatches } from '@/app/lib/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const batches = await readBatches()
  const idx = batches.findIndex((b) => b.batchId === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date().toISOString()
  const batch = batches[idx]
  batch.status = 'executed'
  batch.executedAt = now
  for (const t of batch.transactions) {
    t.status = 'executed'
    t.executedAt = now
  }
  batches[idx] = batch
  await writeBatches(batches)

  return NextResponse.json({ batchId: batch.batchId, status: batch.status, executedAt: now })
}
