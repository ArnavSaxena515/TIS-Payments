'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ResetModal } from './ResetModal'

export function Header() {
  const [showReset, setShowReset] = useState(false)
  return (
    <>
      <header className="border-b border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-navy-900 relative">
              <div className="absolute inset-1 border border-accent" />
            </div>
            <div className="leading-none">
              <div className="font-serif text-xl text-navy-900 tracking-tight">TIS Payments</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 mt-0.5">
                Treasury Intelligence
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-navy-600">
            <span className="hidden sm:inline text-navy-400">Payment Hub</span>
            <button
              onClick={() => setShowReset(true)}
              className="text-navy-500 hover:text-navy-900 transition-colors"
            >
              Reset Demo
            </button>
          </nav>
        </div>
      </header>
      {showReset && <ResetModal onClose={() => setShowReset(false)} />}
    </>
  )
}
