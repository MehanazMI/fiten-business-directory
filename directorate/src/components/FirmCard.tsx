import { Link } from '@tanstack/react-router'
import { Star, BadgeCheck } from 'lucide-react'
import { Button } from './ui/button'
import type { Firm } from '@/data/firms'
import { cn } from '@/lib/utils'

export function FirmCard({ firm }: { firm: Firm }) {
  return (
    <div className={cn(
      'bg-white border border-[var(--color-brand-navy)]/5 rounded-md p-6 flex items-start gap-5 hover:border-[var(--color-brand-navy)]/20 transition-colors',
    )}>
      {/* Monogram */}
      <div className="flex-shrink-0 w-14 h-14 rounded-sm bg-[var(--color-brand-navy)]/5 flex items-center justify-center">
        <span className="font-serif text-sm font-bold text-[var(--color-brand-navy)]">{firm.monogram}</span>
      </div>
      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-serif text-lg text-[var(--color-brand-navy)]">{firm.name}</h3>
          {firm.verified && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-brand-navy)]/5 text-[var(--color-brand-navy)]/70">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
          {firm.topRated && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-brand-gold)]/10 text-[var(--color-brand-navy)]">
              Top Rated
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-brand-slate)] mb-2">{firm.sector} · {firm.location} · {firm.size} employees</p>
        <p className="text-sm text-[var(--color-brand-navy)]/70 leading-relaxed line-clamp-2">{firm.blurb}</p>
        <div className="flex items-center gap-1 mt-3">
          <Star size={13} className="text-[var(--color-brand-gold)] fill-[var(--color-brand-gold)]" />
          <span className="text-sm font-medium text-[var(--color-brand-navy)]">{firm.rating}</span>
          <span className="text-xs text-[var(--color-brand-slate)]">({firm.reviewCount} reviews)</span>
        </div>
      </div>
      {/* CTA */}
      <div className="flex-shrink-0">
        <Button asChild variant="outline" size="sm" className="text-xs tracking-wide">
          <Link to="/firms/$slug" params={{ slug: firm.slug }}>View Profile</Link>
        </Button>
      </div>
    </div>
  )
}
