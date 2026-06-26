import { Suspense } from 'react'
import type { Metadata } from 'next'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import VerifyClient from './VerifyClient'

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

export function VerifyState({ icon, spin, title, body, cta }: {
  icon: string; spin?: boolean; title: string; body: string
  cta?: { href: string; label: string }
}) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <i className={`ti ${icon}`} style={{ fontSize: '3.5rem', color: 'var(--gold)', marginBottom: '1rem', display: 'inline-block', animation: spin ? 'spin 1s linear infinite' : undefined }} aria-hidden="true" />
      <h1 style={{ color: 'var(--cream)', fontSize: '1.6rem', marginBottom: '0.75rem' }}>{title}</h1>
      <p style={{ color: 'var(--cream-70)', lineHeight: 1.7, marginBottom: cta ? '2rem' : 0 }}>{body}</p>
      {cta && <a href={cta.href} className="hdr-btn" style={{ display: 'inline-block' }}>{cta.label}</a>}
    </div>
  )
}
