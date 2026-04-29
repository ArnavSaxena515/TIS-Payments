import { NextResponse } from 'next/server'
import { redis, BATCHES_KEY, RECONCILIATIONS_KEY } from '@/app/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  await Promise.all([redis.del(BATCHES_KEY), redis.del(RECONCILIATIONS_KEY)])
  return NextResponse.json({ status: 'reset' })
}
