'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedCounter from './AnimatedCounter'

interface Props {
  businesses: number
  cities: number
  sectors: number
  continents: number
}

const TRENDING = ['SAP', 'Catering', 'Immigration', 'Bridal Silks', 'Cloud Security']

export default function Hero({ businesses, cities, sectors, continents }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')

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
          <span className="home-hero-badge-dot" />
          Global Tamil Business Network · {cities} Cities · {continents} Continents
        </div>

        <h1 className="home-hero-title">
          Tamil business, <em className="gold-gradient">global reach.</em>
        </h1>

        <p className="home-hero-sub">
          The verified directory of FiTEN-affiliated businesses — from family kitchens in Jaffna to
          capital partners in Singapore. Find partners, clients, talent and investment.
        </p>

        <form onSubmit={submit} className="home-hero-search">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Try ‘SAP consultants’, ‘bridal saree Toronto’, ‘cloud security’…"
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
