import './globals.css'
import type { Metadata } from 'next'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

export const metadata: Metadata = {
  title: 'TIS Payments — Inbound Batch Monitor',
  description: 'Payment hub inbound batch monitor for ISO 20022 pain.001 batches',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
