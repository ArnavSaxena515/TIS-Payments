import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json({
    status: 'not_implemented',
    message: 'Reconciliation endpoint stub — camt.053 generation comes in Phase 2',
  })
}
