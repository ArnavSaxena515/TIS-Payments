import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const url = process.env.REFOLD_TRIGGER_URL
  const apiKey = process.env.REFOLD_API_KEY
  const linkedAccountId = process.env.REFOLD_LINKED_ACCOUNT_ID
  if (!url) return NextResponse.json({ error: 'Refold trigger URL not configured' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch { body = {} }

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        ...(linkedAccountId ? { linked_account_id: linkedAccountId } : {}),
      },
      body: JSON.stringify(body ?? {}),
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Workflow trigger failed', detail: e?.message ?? 'network error' }, { status: 502 })
  }

  const text = await upstream.text()
  let data: any = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Workflow trigger failed', upstreamStatus: upstream.status, detail: data?.error ?? data?.message ?? text?.slice(0, 500) },
      { status: 502 },
    )
  }

  const executionId = data.execution_id ?? data.executionId ?? data.id ?? null
  if (!executionId) {
    return NextResponse.json({ error: 'No execution id in workflow response', detail: data }, { status: 502 })
  }

  return NextResponse.json({ executionId, triggeredAt: new Date().toISOString() })
}
