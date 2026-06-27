'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BusinessCard from '@/app/directory/BusinessCard'
import type { Business } from '@/types/business'

const VISIBLE = 3
const ROTATE_MS = 3200
const FADE_MS = 500

export default function ConnectPreview({ businesses }: { businesses: Business[] }) {
  const router = useRouter()

  const pool = useMemo(
    () =>
      businesses
        .filter(b => b.looking && b.looking.length > 0)
        .sort((a, b) => Number(!!b.pro) - Number(!!a.pro)),
    [businesses]
  )

  const [offset, setOffset] = useState(0)
  const [show, setShow] = useState(true)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (pool.length <= VISIBLE) return
    const id = setInterval(() => {
      setShow(false)
      fadeTimer.current = setTimeout(() => {
        setOffset(o => (o + VISIBLE) % pool.length)
        setShow(true)
      }, FADE_MS)
    }, ROTATE_MS)
    return () => {
      clearInterval(id)
      clearTimeout(fadeTimer.current)
    }
  }, [pool.length])

  if (pool.length === 0) return null

  const shown =
    pool.length <= VISIBLE
      ? pool
      : Array.from({ length: VISIBLE }, (_, i) => pool[(offset + i) % pool.length])

  return (
    <section className="home-connect">
      <div className="home-connect-inner">
        <div className="home-connect-head">
          <div className="sec-kicker sec-kicker-center home-connect-kicker">
            <span className="home-connect-dot" />
            Live Opportunities
          </div>
          <h2 className="sec-title sec-title-center">
            Businesses ready to <em>connect.</em>
          </h2>
          <p className="home-featured-lede">
            Find members actively seeking partners, clients, investment, talent, and mentoring right now.
          </p>
        </div>

        <div className={`home-connect-grid home-fade${show ? ' show' : ''}`}>
          {shown.map(b => (
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
          <a href="/connect" className="home-btn-navy">
            See All Opportunities →
          </a>
        </div>
      </div>
    </section>
  )
}
