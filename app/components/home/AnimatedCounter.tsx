'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const duration = 1400
            const start = performance.now()
            const step = (now: number) => {
              const p = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - p, 3)
              setN(Math.floor(eased * value))
              if (p < 1) requestAnimationFrame(step)
              else setN(value)
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  )
}
