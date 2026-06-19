import type { Metadata } from 'next'
import AddBusinessStandalone from './AddBusinessStandalone'
import { fetchBusinesses } from '@/lib/firestore-rest'

export const metadata: Metadata = {
  title: 'Add Your Business',
  description: 'List your business on the FiTEN Tamil Business Directory. Free listing, live immediately.',
  alternates: { canonical: '/form' },
}

export default async function FormPage() {
  const businesses = await fetchBusinesses().catch(() => [])
  const cityCount = new Set(businesses.map(b => b.city)).size
  const continentCount = new Set(businesses.map(b => {
    const r = b.region?.toLowerCase() ?? ''
    if (r.includes('india') || r.includes('south asia') || r.includes('singapore') || r.includes('australia')) return 'Asia-Pacific'
    if (r.includes('uk') || r.includes('europe')) return 'Europe'
    return 'North America'
  })).size

  const stats = [
    [`${businesses.length}+`, 'Businesses'],
    [`${cityCount}+`, 'Cities'],
    [`${continentCount}`, 'Continents'],
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '5rem', alignItems: 'start' }}>

      {/* Left: navy info panel */}
      <aside style={{ position: 'sticky', top: '3rem' }}>
        <div style={{ background: '#0D2340', padding: '2.5rem', color: 'white' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8972A', marginBottom: '1.25rem' }}>
            For Business Owners
          </p>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '2.25rem', lineHeight: 1.1, fontWeight: 700, color: 'white', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Add your business{' '}
            <em style={{ fontStyle: 'italic', color: '#C8972A' }}>to FiTEN.</em>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '2rem' }}>
            Join Tamil-led businesses trusted by partners, clients, and investors worldwide. Listings are free — sponsorship unlocks priority placement and verified status.
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '2rem' }}>
            {[
              { t: 'Global Reach', d: 'Visible to Tamil entrepreneurs, partners, and investors across the US, India, Canada, UK, Singapore and beyond.' },
              { t: 'Verified Community', d: 'Listings are reviewed by FiTEN community moderators. Free listings go live instantly; sponsored listings receive a verified badge.' },
              { t: 'B2B Signals', d: 'Tell the network what you need — partners, clients, talent, capital, or speaker invitations.' },
            ].map(b => (
              <div key={b.t} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8972A', flexShrink: 0, marginTop: '0.45rem' }} />
                <div>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8972A', marginBottom: '0.25rem' }}>{b.t}</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 600 }}>
              Already in the directory
            </p>
            <div style={{ display: 'flex', gap: '1.75rem' }}>
              {stats.map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C8972A', lineHeight: 1 }}>{n}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <AddBusinessStandalone />
    </div>
  )
}
