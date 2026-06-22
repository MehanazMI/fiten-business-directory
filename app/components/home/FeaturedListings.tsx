'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BusinessCard, { CAT_ICON, CAT_COLOR } from '@/app/directory/BusinessCard'
import type { Business } from '@/types/business'

const STRIP_COUNT = 4
const DOTS_MAX = 10
const ROTATE_MS = 4500
const FADE_MS = 500

export default function FeaturedListings({ businesses }: { businesses: Business[] }) {
  const router = useRouter()

  const pool = useMemo(
    () => [...businesses].sort((a, b) => Number(!!b.pro) - Number(!!a.pro)),
    [businesses]
  )

  const [spot, setSpot] = useState(0)
  const [show, setShow] = useState(true)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = (next: number | ((s: number) => number)) => {
    setShow(false)
    clearTimeout(fadeTimer.current)
    fadeTimer.current = setTimeout(() => {
      setSpot(next)
      setShow(true)
    }, FADE_MS)
  }

  useEffect(() => {
    if (pool.length <= 1) return
    const id = setInterval(() => goTo(s => (s + 1) % pool.length), ROTATE_MS)
    return () => {
      clearInterval(id)
      clearTimeout(fadeTimer.current)
    }
  }, [pool.length])

  if (pool.length === 0) {
    return (
      <section className="home-featured" id="featured">
        <div className="sec-kicker sec-kicker-center">Featured Listings</div>
        <h2 className="sec-title sec-title-center">Meet the <em>network.</em></h2>
      </section>
    )
  }

  const spotlight = pool[spot]
  const strip = Array.from({ length: Math.min(STRIP_COUNT, pool.length - 1) }, (_, i) => {
    const item = pool[(spot + 1 + i) % pool.length]
    return item
  })

  return (
    <section className="home-featured" id="featured">
      <div className="sec-kicker sec-kicker-center">Featured Listings</div>
      <h2 className="sec-title sec-title-center">
        Meet the <em>network.</em>
      </h2>
      <p className="home-featured-lede">
        Real businesses, real momentum — discover who&apos;s shaping the Tamil economy worldwide.
      </p>

      <div className="featured-spotlight">
        <div className={`featured-spot-main home-fade${show ? ' show' : ''}`}>
          <BusinessCard
            business={spotlight}
            isFavorited={false}
            onSelect={biz => router.push(`/directory/${biz.id}`)}
            onFavorite={() => {}}
            lang="en"
          />
        </div>

        <div className={`featured-spot-strip home-fade${show ? ' show' : ''}`}>
          {strip.map(b => {
            const icon = CAT_ICON[b.category] ?? 'ti-building'
            const color = CAT_COLOR[b.category] ?? 'var(--navy)'
            return (
              <button
                key={b.id}
                type="button"
                className="featured-strip-item"
                onClick={() => router.push(`/directory/${b.id}`)}
              >
                <span className="featured-strip-icon">
                  <i className={`ti ${icon}`} style={{ color }} />
                </span>
                <span className="featured-strip-text">
                  <span className="featured-strip-name">{b.businessName}</span>
                  <span className="featured-strip-meta">
                    {b.category}
                    {b.city && <> · {b.city}</>}
                  </span>
                </span>
                <i className="ti ti-arrow-right featured-strip-arrow" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      {pool.length > 1 && pool.length <= DOTS_MAX && (
        <div className="featured-dots" role="tablist" aria-label="Featured business">
          {pool.map((b, i) => (
            <button
              key={b.id}
              type="button"
              className={`featured-dot${i === spot ? ' on' : ''}`}
              aria-label={`Show ${b.businessName}`}
              aria-selected={i === spot}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}

      {pool.length > DOTS_MAX && (
        <div className="featured-counter" aria-live="off">
          {spot + 1} <span className="featured-counter-sep">/</span> {pool.length}
        </div>
      )}

      <div className="home-featured-cta">
        <a href="/directory" className="home-btn-navy">
          Browse the Full Directory →
        </a>
      </div>
    </section>
  )
}
