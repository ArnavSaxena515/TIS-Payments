'use client'

import Link from 'next/link'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ResetModal } from './ResetModal'

export function Header() {
  const [showReset, setShowReset] = useState(false)
  return (
    <>
      <header className="border-b border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/39270/MicrosoftTeams-image_%2821%29.png"
              alt="TIS"
              className="h-8 w-auto object-contain"
            />
            <div className="leading-none border-l border-navy-100 pl-3">
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
              aria-label="Refresh"
              title="Refresh"
              className="p-1.5 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-sm transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </nav>
        </div>
      </header>
      {showReset && <ResetModal onClose={() => setShowReset(false)} />}
    </>
  )
}
