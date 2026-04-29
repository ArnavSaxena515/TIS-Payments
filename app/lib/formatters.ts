export function formatAmount(amount: string, currency?: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return amount
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
  return currency ? `${formatted} ${currency}` : formatted
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return iso
  const diff = Math.floor((Date.now() - then) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, 'Z')
}

export function sumByCurrency(amounts: Array<{ amount: string; currency: string }>): Record<string, string> {
  const map: Record<string, number> = {}
  for (const a of amounts) {
    const n = Number(a.amount)
    if (!Number.isFinite(n) || !a.currency) continue
    map[a.currency] = (map[a.currency] ?? 0) + n
  }
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(map)) out[k] = v.toFixed(2)
  return out
}
