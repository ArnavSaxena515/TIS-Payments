import { XMLParser } from 'fast-xml-parser'
import type { ReconciliationBalance, ReconciliationEntry, ReconciliationStatement } from './types'

const parser = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
})

export class Camt053ParseError extends Error {}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

function text(v: any): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (typeof v === 'object' && '#text' in v) return String(v['#text'])
  return undefined
}

function amtPair(v: any): { amount: string; currency: string } {
  if (v === undefined || v === null) return { amount: '', currency: '' }
  if (typeof v === 'string') return { amount: v, currency: '' }
  if (typeof v === 'object') {
    return { amount: String(v['#text'] ?? ''), currency: String(v['@_Ccy'] ?? '') }
  }
  return { amount: '', currency: '' }
}

function normInd(v: any): 'CRDT' | 'DBIT' {
  return text(v) === 'DBIT' ? 'DBIT' : 'CRDT'
}

export type ParsedCamt053 = Omit<ReconciliationStatement, 'reconciliationId' | 'receivedAt' | 'rawXml'>

export function parseCamt053(xml: string): ParsedCamt053 {
  let root: any
  try {
    root = parser.parse(xml)
  } catch (e: any) {
    throw new Camt053ParseError(`XML parse failed: ${e?.message ?? 'unknown'}`)
  }

  const stmtRoot = root?.Document?.BkToCstmrStmt
  if (!stmtRoot) throw new Camt053ParseError('Missing Document/BkToCstmrStmt')

  const grpHdr = stmtRoot.GrpHdr ?? {}
  const stmt = Array.isArray(stmtRoot.Stmt) ? stmtRoot.Stmt[0] : stmtRoot.Stmt ?? {}

  const messageId = text(grpHdr.MsgId) ?? ''
  const creationDateTime = text(grpHdr.CreDtTm) ?? ''

  const statementId = text(stmt.Id) ?? ''
  const statementCreatedAt = text(stmt.CreDtTm) ?? ''
  const fromDate = text(stmt?.FrToDt?.FrDtTm)
  const toDate = text(stmt?.FrToDt?.ToDtTm)

  const accountId =
    text(stmt?.Acct?.Id?.IBAN) ??
    text(stmt?.Acct?.Id?.Othr?.Id) ??
    ''
  const accountCurrency = text(stmt?.Acct?.Ccy) ?? ''
  const accountOwner = text(stmt?.Acct?.Ownr?.Nm)

  const balances = asArray<any>(stmt.Bal)
  const findBal = (code: string): ReconciliationBalance | undefined => {
    const b = balances.find((x) => text(x?.Tp?.CdOrPrtry?.Cd) === code)
    if (!b) return undefined
    const { amount, currency } = amtPair(b.Amt)
    return {
      amount,
      currency,
      indicator: normInd(b.CdtDbtInd),
      date: text(b?.Dt?.Dt) ?? text(b?.Dt) ?? '',
    }
  }
  const openingBalance = findBal('OPBD')
  const closingBalance = findBal('CLBD')

  const ntries = asArray<any>(stmt.Ntry)
  const entries: ReconciliationEntry[] = ntries.map((n) => {
    const { amount, currency } = amtPair(n.Amt)
    const txDtls = (Array.isArray(n?.NtryDtls?.TxDtls) ? n.NtryDtls.TxDtls[0] : n?.NtryDtls?.TxDtls) ?? {}
    const refs = txDtls.Refs ?? {}
    const cdtrAgt = txDtls?.RltdAgts?.CdtrAgt?.FinInstnId ?? {}
    const cdtr = txDtls?.RltdPties?.Cdtr ?? {}
    return {
      endToEndId: text(refs.EndToEndId) ?? '',
      amount,
      currency,
      creditDebitIndicator: normInd(n.CdtDbtInd),
      status: text(n?.Sts?.Cd) ?? text(n?.Sts),
      bookingDate: text(n?.BookgDt?.Dt) ?? text(n?.BookgDt),
      valueDate: text(n?.ValDt?.Dt) ?? text(n?.ValDt),
      creditorName: text(cdtr?.Nm),
      creditorBic: text(cdtrAgt?.BICFI) ?? text(cdtrAgt?.BIC),
      remittanceInfo: text(txDtls?.RmtInf?.Ustrd),
    }
  })

  const summaryNb = text(stmt?.TxsSummry?.TtlNtries?.NbOfNtries)
  const totalAmount = text(stmt?.TxsSummry?.TtlNtries?.Sum)
  const numberOfEntries = summaryNb && Number.isFinite(Number(summaryNb)) ? Number(summaryNb) : entries.length

  return {
    messageId,
    creationDateTime,
    statementId,
    statementCreatedAt,
    fromDate,
    toDate,
    accountId,
    accountCurrency,
    accountOwner,
    openingBalance,
    closingBalance,
    numberOfEntries,
    totalAmount,
    entries,
  }
}
