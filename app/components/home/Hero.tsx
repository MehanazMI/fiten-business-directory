'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedCounter from './AnimatedCounter'

const PLACEHOLDERS = [
  'Lawyers in Toronto…',
  'IT services in Dubai…',
  'Catering in London…',
  'Cloud security firms…',
  'Bridal saree Toronto…',
  'Accountants in Singapore…',
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

  const stats = [
    { v: businesses, suffix: '+', l: 'Businesses' },
    { v: cities, suffix: '', l: 'Cities' },
    { v: sectors, suffix: '', l: 'Sectors' },
    { v: continents, suffix: '', l: 'Continents' },
  ]

  return (
    <section className="home-hero">
      <div className="home-hero-grid" aria-hidden="true" />
      <div className="home-hero-glow" aria-hidden="true" />
      <div className="home-hero-inner">
        <div className="home-hero-badge">
          <i className="ti ti-world home-hero-badge-globe" aria-hidden="true" />
          Tamil Business Network
        </div>

        <h1 className="home-hero-title">
          Tamil business, <em className="gold-gradient">global reach.</em>
        </h1>

        <p className="home-hero-sub">
          The network where Tamil businesses find each other. Browse verified listings, connect with
          partners, hire talent, and attract investment — all in one place.
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
      </div>
    </section>
  )
}
