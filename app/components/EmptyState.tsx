import { Inbox } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="border border-dashed border-navy-200 bg-white px-6 py-16 text-center">
      <Inbox size={32} className="mx-auto text-navy-300 mb-4" />
      <h3 className="font-serif text-xl text-navy-900 mb-2">Awaiting payment batches</h3>
      <p className="text-navy-500 text-sm max-w-md mx-auto">
        Click <span className="text-navy-900">"Receive Batch from Corporate ERP"</span> to ingest a
        pain.001 batch from the connected workflow.
      </p>
    </div>
  )
}
