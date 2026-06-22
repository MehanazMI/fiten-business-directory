'use client'

import { useState, useEffect, useRef } from 'react'
import { testimonials as fallback } from '@/lib/testimonials'
import { colors, textColors, stableColorIdx } from '@/lib/utils'
import type { Testimonial } from '@/lib/firestore-rest'

const ROTATE_MS = 5500
const FADE_MS = 500

function initials(name: string): string {
  return name
    .replace(/[.]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function TestimonialMarquee({ testimonials }: { testimonials?: Testimonial[] }) {
  const items = testimonials?.length ? testimonials : fallback

  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(true)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = (next: number | ((i: number) => number)) => {
    setShow(false)
    clearTimeout(fadeTimer.current)
    fadeTimer.current = setTimeout(() => {
      setIdx(next)
      setShow(true)
    }, FADE_MS)
  }

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => goTo(i => (i + 1) % items.length), ROTATE_MS)
    return () => {
      clearInterval(id)
      clearTimeout(fadeTimer.current)
    }
  }, [items.length])

  const t = items[idx]
  const ci = stableColorIdx(t.author)

  return (
    <div className="pullquote">
      <div className={`pullquote-body home-fade${show ? ' show' : ''}`}>
        <div className="pullquote-mark" aria-hidden="true">&ldquo;</div>
        <blockquote className="pullquote-q">{t.quote}</blockquote>
        <figcaption className="pullquote-cite">
          <span
            className="pullquote-avatar"
            style={{ background: colors[ci % colors.length], color: textColors[ci % textColors.length] }}
          >
            {initials(t.author)}
          </span>
          <span className="pullquote-meta">
            <span className="pullquote-name">{t.author}</span>
            <span className="pullquote-firm">{t.firm}</span>
          </span>
        </figcaption>
      </div>

      {items.length > 1 && (
        <div className="pullquote-dots" role="tablist" aria-label="Testimonials">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              className={`pullquote-dot${i === idx ? ' on' : ''}`}
              aria-label={`Show testimonial from ${it.author}`}
              aria-selected={i === idx}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
