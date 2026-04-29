import { NextResponse } from 'next/server'
import { readReconciliations } from '@/app/lib/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const items = await readReconciliations()
  const item = items.find((r) => r.reconciliationId === params.id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ reconciliation: item })
}
