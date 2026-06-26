import { Suspense } from 'react'
import type { Metadata } from 'next'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import VerifyClient from './VerifyClient'
import { VerifyState } from './VerifyState'

export const metadata: Metadata = {
  title: 'Verify Listing — FiTEN Business Directory',
}

export default function VerifyPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <Suspense fallback={<VerifyState icon="ti-loader-2" spin title="Verifying…" body="Please wait while we confirm your listing." />}>
          <VerifyClient />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}

export { VerifyState } from './VerifyState'
