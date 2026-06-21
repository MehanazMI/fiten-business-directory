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

const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body>
        {isPreview && (
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: '#C5A059',
            color: '#0F172A',
            textAlign: 'center',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            ⚠ Preview deployment — form submissions are disabled
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
