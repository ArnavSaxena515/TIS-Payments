export interface PaymentBatch {
  batchId: string
  messageId: string
  receivedAt: string
  status: 'received' | 'processing' | 'executed'
  executedAt?: string

  creationDateTime: string
  numberOfTransactions: number
  controlSum: string
  initiatingPartyName: string
  initiatingPartyId?: string

  paymentInfoId: string
  paymentMethod: string
  requestedExecutionDate: string
  debtorName: string
  debtorCountry?: string
  debtorAccount: string
  debtorCurrency: string

  transactions: PaymentTransaction[]
  rawXml: string
}

export interface PaymentTransaction {
  endToEndId: string
  amount: string
  currency: string
  creditorName: string
  creditorBic: string
  creditorBankName?: string
  creditorBankCountry?: string
  creditorAccount?: string
  creditorIban?: string
  remittanceInfo?: string
  status: 'queued' | 'executed' | 'failed'
  executedAt?: string
}

export interface BatchStats {
  totalBatches: number
  totalTransactions: number
  executedBatches: number
  totalValueByCurrency: Record<string, string>
}
