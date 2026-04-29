import { NextRequest, NextResponse } from 'next/server'
import { readReconciliations, writeReconciliations } from '@/app/lib/store'
import { parseCamt053, Camt053ParseError } from '@/app/lib/camt053-parser'
import type { ReconciliationStatement } from '@/app/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const xml = await req.text()
  if (!xml || !xml.trim()) {
    return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
  }

  let parsed
  try {
    parsed = parseCamt053(xml)
  } catch (e: any) {
    if (e instanceof Camt053ParseError) {
      return NextResponse.json({ error: 'Invalid XML', detail: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid XML', detail: String(e?.message ?? e) }, { status: 400 })
  }

  const recon: ReconciliationStatement = {
    reconciliationId: `recon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    rawXml: xml,
    ...parsed,
  }

  const existing = await readReconciliations()
  await writeReconciliations([recon, ...existing])

  return NextResponse.json({
    status: 'accepted',
    reconciliationId: recon.reconciliationId,
    messageId: recon.messageId,
    statementId: recon.statementId,
    numberOfEntries: recon.entries.length,
    acknowledgedAt: recon.receivedAt,
  })
}
