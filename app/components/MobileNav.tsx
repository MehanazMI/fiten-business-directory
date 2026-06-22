'use client'

import { useEffect, useState } from 'react'

interface MobileNavProps {
  activeLink?: 'home' | 'directory' | 'connect' | 'form'
}

const LINKS: { href: string; label: string; key: MobileNavProps['activeLink'] }[] = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/directory', label: 'Directory', key: 'directory' },
  { href: '/connect', label: 'Connect', key: 'connect' },
  { href: '/form', label: 'Get Listed', key: 'form' },
]

export default function MobileNav({ activeLink }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <i className={`ti ${open ? 'ti-x' : 'ti-menu-2'}`} />
      </button>

      {open && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav className="mobile-nav-panel">
            {LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`mobile-nav-link${activeLink === link.key ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
