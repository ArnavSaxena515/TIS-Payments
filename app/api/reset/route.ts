import { NextResponse } from 'next/server'
import { redis, BATCHES_KEY } from '@/app/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  await redis.del(BATCHES_KEY)
  return NextResponse.json({ status: 'reset' })
}
