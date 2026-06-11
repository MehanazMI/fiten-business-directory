import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FiTEN Business Directory',
    template: '%s | FiTEN Business Directory',
  },
  description: 'Discover Tamil-owned businesses worldwide.',
  openGraph: {
    siteName: 'FiTEN Business Directory',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
