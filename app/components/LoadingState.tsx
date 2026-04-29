import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="border border-navy-100 bg-white px-6 py-16 text-center">
      <Loader2 size={24} className="mx-auto animate-spin text-navy-300 mb-3" />
      <p className="text-navy-500 text-sm">Loading…</p>
    </div>
  )
}
