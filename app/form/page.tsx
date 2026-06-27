import type { Metadata } from 'next'
import AddBusinessStandalone from './AddBusinessStandalone'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import { fetchBusinesses } from '@/lib/firestore-rest'
import { deriveGeoStats } from '@/lib/geo'

export const metadata: Metadata = {
  title: 'Add Your Business',
  description: 'List your business on the FiTEN Tamil Business Directory. Free listing, live immediately.',
  alternates: { canonical: '/form' },
}

const BENEFITS = [
  { t: 'Global Reach', d: 'Visible to Tamil entrepreneurs, partners, and investors across the US, India, Canada, UK, Singapore and beyond.' },
  { t: 'SEO-Indexed', d: 'Every listing gets its own URL so customers can find you on Google, not just inside the directory.' },
  { t: 'Verified Community', d: 'Listings are reviewed by FiTEN community moderators. Provide your registration number to fast-track verification.' },
  { t: 'B2B Signals', d: 'Tell the network what you need — partners, clients, talent, capital, or mentoring.' },
]

function count(n: number): string {
  return n >= 50 ? `${Math.floor(n / 10) * 10}+` : `${n}`
}

export default async function FormPage() {
  const businesses = (await fetchBusinesses().catch(() => [])).filter(b => b.status === 'active')
  const cityList = businesses.map(b => b.city).filter(Boolean)
  const cityCount = new Set(cityList).size
  const continentCount = deriveGeoStats(cityList).continents

  const stats: [string, string][] = [
    [count(businesses.length), 'Businesses'],
    [count(cityCount), 'Cities'],
    [String(continentCount), 'Continents'],
  ]

  return (
    <>
      <SiteHeader activeLink="form" />
      <div className="form-page">

        <aside className="form-intro">
          <p className="form-intro-kicker">For Business Owners</p>
          <h1 className="form-intro-title">
            Add your business <em>to FiTEN</em>
          </h1>
          <p className="form-intro-lede">
            Join Tamil-led businesses trusted by partners, clients, and investors worldwide. Listings are
            free for the community — sponsorship unlocks priority placement and verified status.
          </p>

          <div className="form-intro-benefits">
            {BENEFITS.map(b => (
              <div key={b.t} className="form-intro-benefit">
                <span className="form-intro-dot" aria-hidden="true" />
                <div>
                  <p className="form-intro-benefit-title">{b.t}</p>
                  <p className="form-intro-benefit-desc">{b.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="form-intro-stats">
            <p className="form-intro-stats-label">Already in the directory</p>
            <div className="form-intro-stats-row">
              {stats.map(([n, l]) => (
                <div key={l}>
                  <p className="form-intro-stat-num">{n}</p>
                  <p className="form-intro-stat-label">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <AddBusinessStandalone />
      </div>
      <SiteFooter />
    </>
  )
}
