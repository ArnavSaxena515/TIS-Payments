import { NextResponse } from 'next/server'
import { readBatches } from '@/app/lib/store'
import { sumByCurrency } from '@/app/lib/formatters'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const url = process.env.REFOLD_WORKFLOW_2_TRIGGER_URL
  const apiKey = process.env.REFOLD_API_KEY
  const linkedAccountId = process.env.REFOLD_LINKED_ACCOUNT_ID
  const slug = process.env.REFOLD_SLUG_WORKFLOW_2 ?? process.env.REFOLD_SLUG
  const syncExecution = process.env.REFOLD_SYNC_EXECUTION ?? 'false'

  if (!url) {
    return NextResponse.json({ error: 'Workflow 2 trigger URL not configured' }, { status: 500 })
  }

  const batches = await readBatches()
  const executed = batches.filter((b) => b.status === 'executed')
  if (executed.length === 0) {
    return NextResponse.json(
      { error: 'No executed batches available for reconciliation' },
      { status: 400 },
    )
  }

  const allTxns = executed.flatMap((b) => b.transactions)
  const totalsByCurrency = sumByCurrency(allTxns)

  const first = executed[0]
  const now = new Date()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59))

  const payload = {
    reconciliationRequestId: `REQ-${Date.now()}`,
    requestedAt: now.toISOString(),
    debtor: {
      name: first.debtorName,
      country: first.debtorCountry ?? '',
      account: first.debtorAccount,
      currency: first.debtorCurrency,
      bankBic: '',
    },
    statementPeriod: {
      from: startOfDay.toISOString(),
      to: endOfDay.toISOString(),
    },
    batches: executed.map((b) => ({
      batchId: b.batchId,
      messageId: b.messageId,
      executedAt: b.executedAt ?? '',
      numberOfTransactions: b.numberOfTransactions,
      controlSum: b.controlSum,
      transactions: b.transactions.map((t) => ({
        endToEndId: t.endToEndId,
        amount: t.amount,
        currency: t.currency,
        creditorName: t.creditorName,
        creditorBic: t.creditorBic,
        creditorBankName: t.creditorBankName,
        creditorBankCountry: t.creditorBankCountry,
        creditorAccount: t.creditorAccount ?? t.creditorIban ?? '',
        remittanceInfo: t.remittanceInfo,
      })),
    })),
    summary: {
      totalBatches: executed.length,
      totalTransactions: allTxns.length,
      totalsByCurrency,
    },
  }

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        ...(linkedAccountId ? { linked_account_id: linkedAccountId } : {}),
        ...(slug ? { slug } : {}),
        sync_execution: syncExecution,
      },
      body: JSON.stringify(payload),
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Workflow trigger failed', detail: e?.message ?? 'network error' },
      { status: 502 },
    )
  }

  const txt = await upstream.text()
  let data: any = {}
  try { data = txt ? JSON.parse(txt) : {} } catch { data = { raw: txt } }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: 'Workflow trigger failed',
        upstreamStatus: upstream.status,
        detail: data?.error ?? data?.message ?? txt?.slice(0, 500),
      },
      { status: 502 },
    )
  }

  const executionId = data.execution_id ?? data.executionId ?? data.id ?? null
  if (!executionId) {
    return NextResponse.json(
      { error: 'No execution id in workflow response', detail: data },
      { status: 502 },
    )
  }

  return NextResponse.json({
    executionId,
    triggeredAt: now.toISOString(),
    batchesIncluded: executed.length,
    transactionsIncluded: allTxns.length,
    totalsByCurrency,
  })
}
