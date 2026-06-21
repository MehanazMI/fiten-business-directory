import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { fetchBusinesses } from '@/lib/firestore-rest'
import DirectoryClient from './DirectoryClient'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'FiTEN Business Directory — Tamil Business Network' },
  description: 'Discover Tamil-owned businesses worldwide. Connect with partners, clients, investors, and talent across the global Tamil business community.',
  alternates: { canonical: '/directory' },
}

export default async function DirectoryPage() {
  const initialData = await fetchBusinesses()
  return (
    <>
      <SiteHeader activeLink="directory" />
      <ErrorBoundary fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Directory temporarily unavailable.</p>}>
        <Suspense fallback={null}>
          <DirectoryClient initialData={initialData} />
        </Suspense>
      </ErrorBoundary>
      <SiteFooter />
    </>
  )
}
