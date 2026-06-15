import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { FirmCard } from '@/components/FirmCard'
import { firms } from '@/data/firms'
import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export const Route = createFileRoute('/firms/')({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? '',
    sector: (s.sector as string) ?? '',
    location: (s.location as string) ?? '',
  }),
  component: FirmsPage,
})

const sectors = ['Legal', 'Consulting', 'Finance', 'Accounting', 'Human Resources', 'Insurance']
const sizes = ['1–9', '10–49', '50–200', '200+']

function FirmsPage() {
  const { q: initialQ, sector: initialSector } = Route.useSearch()
  const [query, setQuery] = useState(initialQ)
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSector ? [initialSector] : [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('rating')

  function toggleSector(s: string) {
    setSelectedSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  function toggleSize(s: string) {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const results = useMemo(() => {
    let list = firms.filter(f => {
      if (query && !f.name.toLowerCase().includes(query.toLowerCase()) && !f.blurb.toLowerCase().includes(query.toLowerCase()) && !f.services.some(s => s.toLowerCase().includes(query.toLowerCase()))) return false
      if (selectedSectors.length && !selectedSectors.includes(f.sector)) return false
      if (selectedSizes.length && !selectedSizes.includes(f.size)) return false
      if (f.rating < minRating) return false
      return true
    })
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'reviews') list = [...list].sort((a, b) => b.reviewCount - a.reviewCount)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [query, selectedSectors, selectedSizes, minRating, sort])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[var(--color-brand-navy)] mb-2">Browse Firms</h1>
          <p className="text-[var(--color-brand-slate)] text-sm">{results.length} verified firm{results.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white border border-[var(--color-brand-navy)]/5 rounded-md p-6 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal size={14} className="text-[var(--color-brand-slate)]" />
                  <p className="text-xs tracking-widest uppercase text-[var(--color-brand-slate)]">Filters</p>
                </div>
                <input
                  type="text"
                  placeholder="Search firms…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full border border-[var(--color-brand-navy)]/10 rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-gold)] text-[var(--color-brand-navy)]"
                />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[var(--color-brand-navy)] mb-3">Sector</p>
                <div className="space-y-2">
                  {sectors.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedSectors.includes(s)} onChange={() => toggleSector(s)} className="accent-[var(--color-brand-gold)]" />
                      <span className="text-sm text-[var(--color-brand-navy)]">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[var(--color-brand-navy)] mb-3">Firm Size</p>
                <div className="space-y-2">
                  {sizes.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedSizes.includes(s)} onChange={() => toggleSize(s)} className="accent-[var(--color-brand-gold)]" />
                      <span className="text-sm text-[var(--color-brand-navy)]">{s} employees</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[var(--color-brand-navy)] mb-3">Min Rating</p>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="accent-[var(--color-brand-gold)]" />
                      <span className="text-sm text-[var(--color-brand-navy)]">{r === 0 ? 'Any' : `${r}+`}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          {/* Results */}
          <div className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-brand-slate)]">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-xs border border-[var(--color-brand-navy)]/10 rounded px-3 py-2 outline-none text-[var(--color-brand-navy)] bg-white">
                <option value="rating">Sort: Top Rated</option>
                <option value="reviews">Sort: Most Reviewed</option>
                <option value="name">Sort: Name A–Z</option>
              </select>
            </div>
            <div className="flex flex-col gap-4">
              {results.length === 0 ? (
                <div className="bg-white border border-[var(--color-brand-navy)]/5 rounded-md p-12 text-center">
                  <p className="font-serif text-xl text-[var(--color-brand-navy)] mb-2">No firms match your filters</p>
                  <p className="text-sm text-[var(--color-brand-slate)]">Try adjusting the search terms or filters.</p>
                </div>
              ) : results.map(firm => <FirmCard key={firm.id} firm={firm} />)}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
