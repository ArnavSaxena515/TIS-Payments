import { NextResponse } from 'next/server'
import { readBatches } from '@/app/lib/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const batches = await readBatches()
  const batch = batches.find((b) => b.batchId === params.id)
  if (!batch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ batch })
}
