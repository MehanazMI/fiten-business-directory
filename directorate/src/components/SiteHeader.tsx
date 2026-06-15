import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Search } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-widest uppercase text-[var(--color-brand-cream)] hover:text-[var(--color-brand-gold)] transition-colors">
          Directorate
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/70">
          <Link to="/firms" className="hover:text-[var(--color-brand-gold)] transition-colors">Search Firms</Link>
          <a href="#categories" className="hover:text-[var(--color-brand-gold)] transition-colors">Categories</a>
          <a href="#partners" className="hover:text-[var(--color-brand-gold)] transition-colors">For Partners</a>
        </nav>
        <Button asChild variant="gold" size="sm" className="text-xs tracking-widest uppercase">
          <Link to="/submit">Submit Firm</Link>
        </Button>
      </div>
    </header>
  )
}

// Suppress unused import warning - Search icon available for use
void Search
