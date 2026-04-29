import { NextRequest, NextResponse } from 'next/server'
import { redis, BATCHES_KEY } from '@/app/lib/redis'
import { parsePain001, Pain001ParseError } from '@/app/lib/pain001-parser'
import type { PaymentBatch } from '@/app/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const xml = await req.text()
  if (!xml || !xml.trim()) {
    return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
  }

  let parsed
  try {
    parsed = parsePain001(xml)
  } catch (e: any) {
    if (e instanceof Pain001ParseError) {
      const body: any = { error: 'Invalid XML', detail: e.message }
      if (e.missing) {
        body.error = 'Missing required pain.001 fields'
        body.missing = e.missing
      }
      return NextResponse.json(body, { status: 400 })
    }
    return NextResponse.json({ error: 'Parse failure', detail: String(e?.message ?? e) }, { status: 400 })
  }

  const batch: PaymentBatch = {
    batchId: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    status: 'received',
    rawXml: xml,
    ...parsed,
  }

  const existingRaw = await redis.get<string | PaymentBatch[]>(BATCHES_KEY)
  let existing: PaymentBatch[] = []
  if (Array.isArray(existingRaw)) existing = existingRaw
  else if (typeof existingRaw === 'string') {
    try { existing = JSON.parse(existingRaw) } catch { existing = [] }
  }

  const next = [batch, ...existing]
  await redis.set(BATCHES_KEY, JSON.stringify(next))

  return NextResponse.json({
    status: 'accepted',
    batchId: batch.batchId,
    messageId: batch.messageId,
    numberOfTransactions: batch.numberOfTransactions,
    controlSum: batch.controlSum,
    acknowledgedAt: batch.receivedAt,
  })
}
