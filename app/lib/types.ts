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
  totalReconciliations: number
  totalReconciliationEntries: number
  totalValueByCurrency: Record<string, string>
}

export interface ReconciliationBalance {
  amount: string
  currency: string
  indicator: 'CRDT' | 'DBIT'
  date: string
}

export interface ReconciliationEntry {
  endToEndId: string
  amount: string
  currency: string
  creditDebitIndicator: 'CRDT' | 'DBIT'
  status?: string
  bookingDate?: string
  valueDate?: string
  creditorName?: string
  creditorBic?: string
  remittanceInfo?: string
}

export interface ReconciliationStatement {
  reconciliationId: string
  receivedAt: string
  messageId: string
  creationDateTime: string
  statementId: string
  statementCreatedAt: string
  fromDate?: string
  toDate?: string
  accountId: string
  accountCurrency: string
  accountOwner?: string
  openingBalance?: ReconciliationBalance
  closingBalance?: ReconciliationBalance
  numberOfEntries: number
  totalAmount?: string
  entries: ReconciliationEntry[]
  rawXml: string
}
