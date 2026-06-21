'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BusinessCard from '@/app/directory/BusinessCard'
import type { Business } from '@/types/business'

const CATEGORIES = ['All', 'Food', 'Retail', 'Tech', 'Healthcare', 'Finance', 'Education', 'Legal'] as const

export default function FeaturedListings({ businesses }: { businesses: Business[] }) {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>('All')

  const featured = useMemo(() => {
    const pool = activeCat === 'All' ? businesses : businesses.filter(b => b.category === activeCat)
    return [...pool].sort((a, b) => Number(!!b.pro) - Number(!!a.pro)).slice(0, 6)
  }, [businesses, activeCat])

  return (
    <section className="home-featured" id="featured">
      <div className="sec-kicker sec-kicker-center">Featured Listings</div>
      <h2 className="sec-title sec-title-center">
        Hand-picked, <em>community-verified.</em>
      </h2>

      <div className="home-chips">
        {CATEGORIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCat(c)}
            className={`home-chip${activeCat === c ? ' active' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="home-featured-grid">
        {featured.map(b => (
          <BusinessCard
            key={b.id}
            business={b}
            isFavorited={false}
            onSelect={biz => router.push(`/directory/${biz.id}`)}
            onFavorite={() => {}}
            lang="en"
          />
        ))}
      </div>

      <div className="home-featured-cta">
        <a href="/directory" className="home-btn-navy">
          Browse the Full Directory →
        </a>
      </div>
    </section>
  )
}
