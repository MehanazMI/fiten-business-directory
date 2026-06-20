import type { Metadata } from 'next'
import { fetchBusinesses } from '@/lib/firestore-rest'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import Hero from '@/app/components/home/Hero'
import FeaturedListings from '@/app/components/home/FeaturedListings'
import WorldMap from '@/app/components/home/WorldMap'
import TestimonialMarquee from '@/app/components/home/TestimonialMarquee'
import AnimatedCounter from '@/app/components/home/AnimatedCounter'

export const metadata: Metadata = {
  title: 'FiTEN Business Directory — Connect with Tamil Businesses Worldwide',
  description:
    'The global business directory of the FiTEN community. Discover Tamil-led businesses across food, tech, retail, healthcare, finance, and more. Partners · Clients · Talent · Investment.',
  alternates: { canonical: '/' },
}

export const revalidate = 3600

const HOW_IT_WORKS = [
  { n: '01', t: 'Discover', d: 'Search by sector, city, or signal. Filter by FeTNA sponsorship, women-led, hiring, and more.' },
  { n: '02', t: 'Connect', d: 'Save shortlists and explore profiles. Reach out directly from each business listing.' },
  { n: '03', t: 'Transact', d: 'Hire, partner, invest, or refer — all within a verified, accountable community network.' },
]

const REGIONS = [
  { l: 'Americas', n: 6 },
  { l: 'Asia', n: 4 },
  { l: 'Europe / GCC', n: 2 },
]

export default async function HomePage() {
  const businesses = await fetchBusinesses().catch(() => [])
  const active = businesses.filter(b => b.status === 'active')

  const cities = new Set(active.map(b => b.city).filter(Boolean)).size
  const sectors = new Set(active.map(b => b.category).filter(Boolean)).size

  return (
    <>
      <SiteHeader />

      <Hero businesses={active.length} cities={cities} sectors={sectors} continents={3} />

      <FeaturedListings businesses={active} />

      {/* GLOBAL MAP */}
      <section className="home-map">
        <div className="home-map-inner">
          <div className="home-map-copy">
            <div className="sec-kicker sec-kicker-gold">Global Presence</div>
            <h2 className="sec-title sec-title-light">
              One community, <em className="gold-text">12 cities.</em>
            </h2>
            <p className="home-map-text">
              Members trade, hire, and invest across North America, Europe, the Gulf, ASEAN, and South
              Asia. The map grows each time a new business joins.
            </p>
            <div className="home-map-regions">
              {REGIONS.map(r => (
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
            <WorldMap />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-testimonials">
        <div className="home-testimonials-head">
          <div className="sec-kicker sec-kicker-center">In Their Words</div>
          <h2 className="sec-title sec-title-center">What clients &amp; partners say.</h2>
        </div>
        <TestimonialMarquee />
      </section>

      {/* HOW IT WORKS */}
      <section className="home-howit">
        <div className="home-howit-head">
          <div className="sec-kicker sec-kicker-center">How It Works</div>
          <h2 className="sec-title sec-title-center">Three steps. Real introductions.</h2>
        </div>
        <div className="home-howit-grid">
          {HOW_IT_WORKS.map(s => (
            <div key={s.n} className="home-howit-step">
              <div className="home-howit-num">{s.n}</div>
              <h3 className="home-howit-step-title">{s.t}</h3>
              <p className="home-howit-step-desc">{s.d}</p>
            </div>
          ))}
        </div>
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
            Free for the community. Verified listings. Premium profiles for FeTNA sponsors with featured
            placement and priority visibility.
          </p>
          <div className="home-join-cta">
            <a href="/form" className="home-btn-gold">
              Add Your Business
            </a>
            <a href="/directory" className="home-btn-ghost">
              Browse Directory
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
