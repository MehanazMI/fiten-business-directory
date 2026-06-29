'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedCounter from './AnimatedCounter'

const PLACEHOLDERS = [
  'Accountants in New Jersey…',
  'IT services in Singapore…',
  'Catering in New York…',
  'Cloud security firms…',
  'Bridal saree in Chennai…',
  'Lawyers in Sydney…',
]

interface Props {
  businesses: number
  cities: number
  sectors: number
  continents: number
  trending?: string[]
}

const DEFAULT_TRENDING = ['SAP', 'Catering', 'Immigration', 'Bridal Silks', 'Cloud Security']

export default function Hero({ businesses, cities, sectors, continents, trending }: Props) {
  const TRENDING = trending?.length ? trending : DEFAULT_TRENDING
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 2800)
    return () => clearInterval(id)
  }, [])

  const goToDirectory = (q: string) => {
    router.push(q ? `/directory?q=${encodeURIComponent(q)}` : '/directory')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    goToDirectory(query.trim())
  }

  // Only badge a count with "+" once it's large enough to impress, rounding down
  // to the nearest 10 (e.g. 153 → "150+"). Small counts show their exact value.
  const bigStat = (n: number): { v: number; suffix: string } =>
    n >= 50 ? { v: Math.floor(n / 10) * 10, suffix: '+' } : { v: n, suffix: '' }

  const stats = [
    { ...bigStat(businesses), l: 'Businesses' },
    { ...bigStat(cities), l: 'Cities' },
    { ...bigStat(sectors), l: 'Sectors' },
    { v: continents, suffix: '', l: 'Continents' },
  ]

  return (
    <section className="home-hero">
      <div className="home-hero-grid" aria-hidden="true" />
      <div className="home-hero-glow" aria-hidden="true" />
      <div className="home-hero-inner">
        <div className="home-hero-badge">
          <i className="ti ti-star home-hero-badge-globe" aria-hidden="true" />
          Founding Member Program — Free Forever
        </div>

        <h1 className="home-hero-title">
          Tamil business, <em className="gold-gradient">global reach.</em>
        </h1>

        <p className="home-hero-sub">
          A private, verified business network for the Tamil community. Find partners, clients,
          talent, investment, and mentors — all within a community that holds each other accountable.
        </p>

        <form onSubmit={submit} className="home-hero-search">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            aria-label="Search businesses"
          />
          <button type="submit">Search</button>
        </form>

        <div className="home-hero-trending">
          <span className="home-hero-trending-label">Trending:</span>
          {TRENDING.map(t => (
            <button key={t} type="button" onClick={() => goToDirectory(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="home-stats">
          {stats.map(s => (
            <div key={s.l} className="home-stat">
              <div className="home-stat-num">
                <AnimatedCounter value={s.v} suffix={s.suffix} />
              </div>
              <div className="home-stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="home-hero-founding-note">
          <i className="ti ti-lock-open" aria-hidden="true" />
          First 100 businesses join free — and stay free forever.{' '}
          <a href="/form">Claim your spot →</a>
        </p>
      </div>
    </section>
  )
}
