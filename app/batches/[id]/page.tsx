import { notFound } from 'next/navigation'
import { readBatches } from '@/app/lib/store'
import { BatchDetail } from '@/app/components/BatchDetail'

export const dynamic = 'force-dynamic'

export default async function BatchPage({ params }: { params: { id: string } }) {
  const batches = await readBatches()
  const batch = batches.find((b) => b.batchId === params.id)
  if (!batch) notFound()
  return <BatchDetail initial={batch} />
}
