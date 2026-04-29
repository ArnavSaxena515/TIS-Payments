'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TriggerState = 'idle' | 'triggering' | 'polling' | 'success' | 'failed' | 'timeout'

export interface Toast {
  type: 'success' | 'error' | 'info'
  message: string
  detail?: string
}

interface Options {
  onCompleted?: () => void | Promise<void>
  triggerEndpoint?: string
  successMessage?: string
  triggerErrorMessage?: string
}

export function useTriggerAndPoll(opts: Options = {}) {
  const triggerEndpoint = opts.triggerEndpoint ?? '/api/trigger'
  const successMessage = opts.successMessage ?? 'Payment batch received'
  const triggerErrorMessage = opts.triggerErrorMessage ?? 'Workflow trigger failed — check Refold connection'

  const [state, setState] = useState<TriggerState>('idle')
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [toast, setToast] = useState<Toast | null>(null)

  const startedRef = useRef<number>(0)
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelledRef = useRef(false)

  const clearAll = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current.clear()
    if (tickerRef.current) {
      clearInterval(tickerRef.current)
      tickerRef.current = null
    }
  }, [])

  useEffect(() => () => { cancelledRef.current = true; clearAll() }, [clearAll])

  const schedule = (ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timersRef.current.delete(t)
      if (!cancelledRef.current) fn()
    }, ms)
    timersRef.current.add(t)
  }

  const finish = useCallback((next: TriggerState, t?: Toast) => {
    clearAll()
    setState(next)
    if (t) setToast(t)
    const resetMs = next === 'failed' ? 5000 : 2500
    schedule(resetMs, () => {
      setState('idle')
      setExecutionId(null)
      setElapsed(0)
    })
  }, [clearAll])

  const pollOnce = useCallback(async (id: string): Promise<'continue' | 'done' | 'failed'> => {
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(id)}`, { cache: 'no-store' })
      if (!res.ok) return 'continue'
      const data = await res.json()
      if (data.status === 'COMPLETED') return 'done'
      if (data.status === 'FAILED') {
        setToast({ type: 'error', message: 'Workflow failed', detail: data.error ?? id })
        return 'failed'
      }
      return 'continue'
    } catch {
      return 'continue'
    }
  }, [])

  const startPolling = useCallback((id: string) => {
    setState('polling')
    startedRef.current = Date.now()
    setElapsed(0)
    tickerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000))
    }, 500)

    const loop = async () => {
      let attempts = 0
      while (!cancelledRef.current) {
        const elapsedSec = (Date.now() - startedRef.current) / 1000
        if (elapsedSec >= 90) {
          finish('timeout', { type: 'info', message: 'Workflow still running — refresh manually if needed' })
          return
        }
        const r = await pollOnce(id)
        if (r === 'done') {
          if (opts.onCompleted) await opts.onCompleted()
          schedule(1000, () => { opts.onCompleted?.() })
          finish('success', { type: 'success', message: successMessage })
          return
        }
        if (r === 'failed') {
          finish('failed')
          return
        }
        attempts++
        const e = (Date.now() - startedRef.current) / 1000
        const wait = e < 20 ? 2000 : e < 45 ? 5000 : 10000
        await new Promise((res) => {
          const t = setTimeout(() => { timersRef.current.delete(t); res(null) }, wait)
          timersRef.current.add(t)
        })
      }
    }
    loop()
  }, [finish, pollOnce, opts])

  const trigger = useCallback(async () => {
    if (state !== 'idle') return
    cancelledRef.current = false
    setToast(null)
    setState('triggering')
    try {
      const res = await fetch(triggerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.executionId) {
        finish('failed', {
          type: 'error',
          message: triggerErrorMessage,
          detail: data?.detail ?? data?.error,
        })
        return
      }
      setExecutionId(data.executionId)
      startPolling(data.executionId)
    } catch (e: any) {
      finish('failed', { type: 'error', message: 'Workflow trigger failed', detail: e?.message })
    }
  }, [state, finish, startPolling])

  const dismissToast = useCallback(() => setToast(null), [])

  return { state, executionId, elapsed, toast, trigger, dismissToast }
}

export function pollingMessage(elapsed: number): string {
  if (elapsed < 10) return 'Awaiting payment batch from corporate ERP…'
  if (elapsed < 25) return 'Workflow running — pulling open payables from SAP…'
  if (elapsed < 45) return 'Generating pain.001 batch…'
  return 'Still working… (this is taking longer than usual)'
}

export function reconciliationPollingMessage(elapsed: number): string {
  if (elapsed < 10) return 'Workflow running — generating camt.053 statement…'
  if (elapsed < 25) return 'Mapping reconciliation entries…'
  if (elapsed < 45) return 'Preparing statement…'
  return 'Still working… (this is taking longer than usual)'
}
