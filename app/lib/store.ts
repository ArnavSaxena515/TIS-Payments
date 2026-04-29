import { redis, BATCHES_KEY, RECONCILIATIONS_KEY } from './redis'
import type { PaymentBatch, ReconciliationStatement } from './types'

async function readArr<T>(key: string): Promise<T[]> {
  const raw = await redis.get<string | T[]>(key)
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

export async function readBatches(): Promise<PaymentBatch[]> {
  return readArr<PaymentBatch>(BATCHES_KEY)
}

export async function writeBatches(batches: PaymentBatch[]): Promise<void> {
  await redis.set(BATCHES_KEY, JSON.stringify(batches))
}

export async function readReconciliations(): Promise<ReconciliationStatement[]> {
  return readArr<ReconciliationStatement>(RECONCILIATIONS_KEY)
}

export async function writeReconciliations(items: ReconciliationStatement[]): Promise<void> {
  await redis.set(RECONCILIATIONS_KEY, JSON.stringify(items))
}
