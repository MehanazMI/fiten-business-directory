import type { Metadata } from 'next'
import { fetchBusinesses, fetchTestimonials } from '@/lib/firestore-rest'
import { deriveGeoStats } from '@/lib/geo'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import Hero from '@/app/components/home/Hero'
import FeaturedListings from '@/app/components/home/FeaturedListings'
import ConnectPreview from '@/app/components/home/ConnectPreview'
import WorldMap from '@/app/components/home/WorldMapLazy'
import TestimonialMarquee from '@/app/components/home/TestimonialMarquee'
import AnimatedCounter from '@/app/components/home/AnimatedCounter'
import FetnaPromo from '@/app/components/home/FetnaPromo'

export const metadata: Metadata = {
  title: 'FiTEN Business Directory — Connect with Tamil Businesses Worldwide',
  description:
    'The global business directory of the FiTEN community. Discover Tamil-led businesses across food, tech, retail, healthcare, finance, and more. Partners · Clients · Talent · Investment.',
  alternates: { canonical: '/' },
}

export const revalidate = 3600

const TRENDING_LIMIT = 5

const HOW_IT_WORKS = [
  { n: '01', t: 'Discover', d: 'Search by sector, city, or signal. Filter by FeTNA sponsorship, women-led, hiring, and more.', icon: 'ti-search',          href: '/directory', cta: 'Browse the directory' },
  { n: '02', t: 'Connect',  d: 'Save shortlists and explore profiles. Reach out directly from each business listing.',        icon: 'ti-heart-handshake', href: '/connect',   cta: 'See opportunities' },
  { n: '03', t: 'Grow',     d: 'Hire, partner, invest, or refer — all within a verified, accountable community network.',     icon: 'ti-trending-up',     href: '/form',      cta: 'Add your business' },
]

const JOIN_BENEFITS = [
  { icon: 'ti-gift',          label: 'Free for the community' },
  { icon: 'ti-circle-check',  label: 'Verified listings' },
  { icon: 'ti-rosette',       label: 'Premium placement for sponsors' },
]

function humanList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export default async function HomePage() {
  const [businesses, testimonials] = await Promise.all([
    fetchBusinesses().catch(() => []),
    fetchTestimonials().catch(() => []),
  ])
  const active = businesses.filter(b => b.status === 'active')

  const cityList = active.map(b => b.city).filter(Boolean)
  const cities = new Set(cityList).size
  const sectors = new Set(active.map(b => b.category).filter(Boolean)).size

  const { continents, regions, pins } = deriveGeoStats(cityList)

  const trending = Object.entries(
    active.reduce<Record<string, number>>((acc, b) => {
      if (b.category) acc[b.category] = (acc[b.category] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, TRENDING_LIMIT)
    .map(([cat]) => cat)

  return (
    <>
      <SiteHeader activeLink="home" />

      <Hero businesses={active.length} cities={cities} sectors={sectors} continents={continents} trending={trending} />

      <FetnaPromo />

      <FeaturedListings businesses={active} />

      <ConnectPreview businesses={active} />

      {/* GLOBAL MAP */}
      <section className="home-map">
        <div className="home-map-inner">
          <div className="home-map-copy">
            <div className="sec-kicker sec-kicker-gold">Global Presence</div>
            <h2 className="sec-title sec-title-light">
              One community, <em className="gold-text">{cities} cities.</em>
            </h2>
            <p className="home-map-text">
              Members trade, hire, and invest across {continents}{' '}
              {continents === 1 ? 'continent' : 'continents'}
              {regions.length > 0 && <> — from {humanList(regions.map(r => r.l))}</>}. The map grows
              each time a new business joins.
            </p>
            <div className="home-map-regions">
              {regions.map(r => (
                <div key={r.l} className="home-map-region">
                  <div className="home-map-region-num">
                    <AnimatedCounter value={r.n} />
                  </div>
                  <div className="home-map-region-label">{r.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-map-canvas">
            <WorldMap pins={pins} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-howit">
        <div className="home-howit-head">
          <div className="sec-kicker sec-kicker-center">How It Works</div>
          <h2 className="sec-title sec-title-center">Three steps. Real introductions.</h2>
        </div>
        <div className="home-howit-grid">
          {HOW_IT_WORKS.map(s => (
            <a key={s.n} href={s.href} className="home-howit-step">
              <div className="home-howit-step-head">
                <span className="home-howit-num">{s.n}</span>
                <span className="home-howit-icon"><i className={`ti ${s.icon}`} aria-hidden="true" /></span>
              </div>
              <h3 className="home-howit-step-title">{s.t}</h3>
              <p className="home-howit-step-desc">{s.d}</p>
              <span className="home-howit-link">
                {s.cta} <i className="ti ti-arrow-right" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-testimonials">
        <div className="home-testimonials-head">
          <div className="sec-kicker sec-kicker-center">In Their Words</div>
          <h2 className="sec-title sec-title-center">Trusted by the <em>community.</em></h2>
        </div>
        <TestimonialMarquee testimonials={testimonials} />
      </section>

      {/* JOIN CTA */}
      <section className="home-join">
        <div className="home-join-grid" aria-hidden="true" />
        <div className="home-join-inner">
          <div className="sec-kicker sec-kicker-gold">For Business Owners</div>
          <h2 className="sec-title sec-title-light">
            Get found by the people <em className="gold-text">who already trust you.</em>
          </h2>
          <p className="home-join-text">
            List your business in minutes and get discovered by the community that already values your
            work.
          </p>
          <div className="home-join-benefits">
            {JOIN_BENEFITS.map(b => (
              <span key={b.label} className="home-join-benefit">
                <i className={`ti ${b.icon}`} aria-hidden="true" />
                {b.label}
              </span>
            ))}
          </div>
          <div className="home-join-cta">
            <a href="/form" className="home-btn-gold">
              Add Your Business
            </a>
            <a href="/directory" className="home-btn-ghost">
              Browse Directory
            </a>
          </div>
          {active.length > 0 && (
            <p className="home-join-proof">
              <i className="ti ti-users" aria-hidden="true" />
              <strong>{active.length}</strong> Tamil businesses already listed
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
