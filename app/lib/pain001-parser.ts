import { XMLParser } from 'fast-xml-parser'
import type { PaymentBatch, PaymentTransaction } from './types'

const parser = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
})

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

function pick(obj: any, ...path: string[]): any {
  let cur = obj
  for (const k of path) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}

function text(v: any): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (typeof v === 'object' && '#text' in v) return String(v['#text'])
  return undefined
}

export class Pain001ParseError extends Error {
  missing?: string[]
  constructor(message: string, missing?: string[]) {
    super(message)
    this.missing = missing
  }
}

export function parsePain001(xml: string): Omit<PaymentBatch, 'batchId' | 'receivedAt' | 'status' | 'rawXml'> {
  let parsed: any
  try {
    parsed = parser.parse(xml)
  } catch (e: any) {
    throw new Pain001ParseError(`XML parse failed: ${e?.message ?? 'unknown'}`)
  }

  const root = parsed?.Document?.CstmrCdtTrfInitn
  if (!root) throw new Pain001ParseError('Missing Document/CstmrCdtTrfInitn')

  const grpHdr = root.GrpHdr
  const pmtInf = Array.isArray(root.PmtInf) ? root.PmtInf[0] : root.PmtInf
  if (!grpHdr || !pmtInf) throw new Pain001ParseError('Missing GrpHdr or PmtInf')

  const messageId = text(grpHdr.MsgId)
  const creationDateTime = text(grpHdr.CreDtTm)
  const nbOfTxs = text(grpHdr.NbOfTxs)
  const controlSum = text(grpHdr.CtrlSum)
  const initiatingPartyName = text(pick(grpHdr, 'InitgPty', 'Nm')) ?? ''
  const initiatingPartyId = text(pick(grpHdr, 'InitgPty', 'Id', 'OrgId', 'Othr', 'Id'))

  const paymentInfoId = text(pmtInf.PmtInfId) ?? ''
  const paymentMethod = text(pmtInf.PmtMtd) ?? ''
  const requestedExecutionDate =
    text(pick(pmtInf, 'ReqdExctnDt', 'Dt')) ?? text(pmtInf.ReqdExctnDt) ?? ''
  const debtorName = text(pick(pmtInf, 'Dbtr', 'Nm')) ?? ''
  const debtorCountry = text(pick(pmtInf, 'Dbtr', 'PstlAdr', 'Ctry'))
  const debtorAccount =
    text(pick(pmtInf, 'DbtrAcct', 'Id', 'IBAN')) ??
    text(pick(pmtInf, 'DbtrAcct', 'Id', 'Othr', 'Id')) ??
    ''
  const debtorCurrency = text(pick(pmtInf, 'DbtrAcct', 'Ccy')) ?? ''

  const missing: string[] = []
  if (!messageId) missing.push('MsgId')
  if (!creationDateTime) missing.push('CreDtTm')
  if (!nbOfTxs) missing.push('NbOfTxs')
  if (!controlSum) missing.push('CtrlSum')
  if (missing.length) throw new Pain001ParseError('Missing required pain.001 fields', missing)

  const txnsRaw = asArray(pmtInf.CdtTrfTxInf)
  const transactions: PaymentTransaction[] = txnsRaw.map((t: any) => {
    const endToEndId = text(pick(t, 'PmtId', 'EndToEndId')) ?? ''
    const amtNode = pick(t, 'Amt', 'InstdAmt')
    let amount = ''
    let currency = ''
    if (amtNode && typeof amtNode === 'object') {
      amount = text(amtNode) ?? amtNode['#text'] ?? ''
      currency = amtNode['@_Ccy'] ?? ''
    } else if (typeof amtNode === 'string') {
      amount = amtNode
    }
    const creditorName = text(pick(t, 'Cdtr', 'Nm')) ?? ''
    const creditorBic =
      text(pick(t, 'CdtrAgt', 'FinInstnId', 'BICFI')) ??
      text(pick(t, 'CdtrAgt', 'FinInstnId', 'BIC')) ??
      ''
    const creditorBankName = text(pick(t, 'CdtrAgt', 'FinInstnId', 'Nm'))
    const creditorBankCountry = text(pick(t, 'CdtrAgt', 'FinInstnId', 'PstlAdr', 'Ctry'))
    const creditorIban = text(pick(t, 'CdtrAcct', 'Id', 'IBAN'))
    const creditorAccount = creditorIban
      ? undefined
      : text(pick(t, 'CdtrAcct', 'Id', 'Othr', 'Id'))
    const remittanceInfo = text(pick(t, 'RmtInf', 'Ustrd'))

    return {
      endToEndId,
      amount,
      currency,
      creditorName,
      creditorBic,
      creditorBankName,
      creditorBankCountry,
      creditorAccount,
      creditorIban,
      remittanceInfo,
      status: 'queued' as const,
    }
  })

  return {
    messageId: messageId!,
    creationDateTime: creationDateTime!,
    numberOfTransactions: Number(nbOfTxs),
    controlSum: controlSum!,
    initiatingPartyName,
    initiatingPartyId,
    paymentInfoId,
    paymentMethod,
    requestedExecutionDate,
    debtorName,
    debtorCountry,
    debtorAccount,
    debtorCurrency,
    transactions,
  }
}
