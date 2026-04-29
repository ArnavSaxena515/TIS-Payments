import { formatAmount } from '../lib/formatters'

export function CurrencyAmount({ amount, currency, className = '' }: { amount: string; currency?: string; className?: string }) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatAmount(amount)}
      {currency && <span className="ml-1.5 text-navy-400 text-[0.85em]">{currency}</span>}
    </span>
  )
}
