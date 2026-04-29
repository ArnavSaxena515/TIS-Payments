import { redis, BATCHES_KEY } from './redis'
import type { PaymentBatch } from './types'

export async function readBatches(): Promise<PaymentBatch[]> {
  const raw = await redis.get<string | PaymentBatch[]>(BATCHES_KEY)
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

export async function writeBatches(batches: PaymentBatch[]): Promise<void> {
  await redis.set(BATCHES_KEY, JSON.stringify(batches))
}
