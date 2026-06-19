import type { Metadata } from 'next'
import AddBusinessStandalone from './AddBusinessStandalone'

export const metadata: Metadata = {
  title: 'Add Your Business',
  description: 'List your Tamil-owned business on the FiTEN Business Directory. Free listing, live immediately.',
  alternates: { canonical: '/form' },
}

export default function FormPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem 4rem', display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2.5rem', alignItems: 'start' }}>
      {/* Left info panel */}
      <aside style={{ position: 'sticky', top: '2rem' }}>
        <div style={{ background: '#0D2340', borderRadius: '0.8rem', padding: '2rem', color: 'white' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#C8972A', marginBottom: '0.75rem' }}>
            Why List With Us
          </p>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem' }}>
            Reach Tamil entrepreneurs worldwide
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            FiTEN Business Directory is the only platform built exclusively for the Tamil business community — connecting founders, investors, and professionals year-round.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.75rem' }}>
            {[
              { icon: '⚡', title: 'Live instantly', body: 'Your listing appears in the directory the moment you submit — no waiting, no approval queue.' },
              { icon: '🔍', title: 'SEO-indexed', body: 'Every listing gets its own Google-indexed URL, bringing organic visibility beyond the Tamil community.' },
              { icon: '🤝', title: 'B2B connections', body: 'Signal exactly what you need — partners, clients, investment, or talent — so the right people find you.' },
              { icon: '🏅', title: 'Community trust', body: 'FeTNA-affiliated badges for sponsors, women-led businesses, and conference speakers set you apart.' },
            ].map(b => (
              <div key={b.title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', marginTop: '0.1rem', flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C8972A', marginBottom: '0.2rem' }}>{b.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 600 }}>
              Already in the directory
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {[['22+', 'Businesses'], ['10+', 'Cities'], ['3', 'Continents']].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#C8972A', lineHeight: 1 }}>{n}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>{l}</p>
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
