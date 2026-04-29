import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeStatus(s: any): 'RUNNING' | 'COMPLETED' | 'FAILED' {
  if (!s) return 'RUNNING'
  const v = String(s).toUpperCase()
  if (['COMPLETED', 'COMPLETE', 'SUCCESS', 'SUCCEEDED', 'DONE', 'FINISHED'].includes(v)) return 'COMPLETED'
  if (['FAILED', 'FAILURE', 'ERROR', 'CANCELLED', 'CANCELED'].includes(v)) return 'FAILED'
  return 'RUNNING'
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const tmpl = process.env.REFOLD_STATUS_URL_TEMPLATE
  const apiKey = process.env.REFOLD_API_KEY
  const linkedAccountId = process.env.REFOLD_LINKED_ACCOUNT_ID
  if (!tmpl) return NextResponse.json({ error: 'Refold status URL not configured' }, { status: 500 })

  const url = tmpl.replace('{executionId}', encodeURIComponent(params.id))

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'GET',
      headers: {
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        ...(linkedAccountId ? { linked_account_id: linkedAccountId } : {}),
      },
    })
  } catch {
    return NextResponse.json({ executionId: params.id, status: 'RUNNING' })
  }

  if (upstream.status === 404) {
    return NextResponse.json({ executionId: params.id, status: 'RUNNING' })
  }
  if (upstream.status >= 500) {
    return NextResponse.json({ error: 'Upstream error', upstreamStatus: upstream.status }, { status: 502 })
  }

  const text = await upstream.text()
  let data: any = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }

  const rawStatus = data.status ?? data.state ?? data.execution_status ?? data.executionStatus
  const status = normalizeStatus(rawStatus)
  const completedAt = status === 'COMPLETED' ? (data.completed_at ?? data.completedAt ?? new Date().toISOString()) : undefined
  const error = status === 'FAILED' ? (data.error ?? data.message ?? 'Workflow failed') : undefined

  return NextResponse.json({ executionId: params.id, status, completedAt, error })
}
