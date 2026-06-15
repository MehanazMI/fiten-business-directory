import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { FirmCard } from '@/components/FirmCard'
import { Button } from '@/components/ui/button'
import { firms } from '@/data/firms'
import { Search, MapPin } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const sectors = ['Legal', 'Consulting', 'Finance', 'Accounting', 'Human Resources', 'Insurance']
const featured = firms.filter(f => f.topRated).slice(0, 3)
const steps = [
  { n: '01', title: 'Application', body: 'Firms submit verified credentials, client references, and principal biographies for initial review.' },
  { n: '02', title: 'Due Diligence', body: 'Our editorial team conducts independent reference checks, regulatory searches, and principal background verification.' },
  { n: '03', title: 'Annual Review', body: 'Verified status is renewed annually. Firms losing credentials or receiving significant complaints are suspended.' },
]

function HomePage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ to: '/firms', search: { q: query, location, sector: '' } })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-6">The Verified Professional Services Directory</p>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight text-[var(--color-brand-navy)] mb-6">
              Find Vetted Professionals <em>You Can Trust</em>
            </h1>
            <p className="text-lg text-[var(--color-brand-slate)] mb-10 leading-relaxed">
              Every firm on Directorate has passed our 3-stage verification process. Trusted by institutional buyers, private equity firms, and executive teams across North America.
            </p>

            {/* Search panel */}
            <form onSubmit={handleSearch} className="bg-white rounded-md shadow-sm border border-[var(--color-brand-navy)]/10 p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <Search size={16} className="text-[var(--color-brand-slate)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Firm name or service type…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 text-sm outline-none text-[var(--color-brand-navy)] placeholder:text-[var(--color-brand-slate)]/60 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 border-t sm:border-t-0 sm:border-l border-[var(--color-brand-navy)]/10">
                <MapPin size={16} className="text-[var(--color-brand-slate)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City or state…"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-36 text-sm outline-none text-[var(--color-brand-navy)] placeholder:text-[var(--color-brand-slate)]/60 bg-transparent"
                />
              </div>
              <Button type="submit" variant="default" className="text-xs tracking-widest uppercase shrink-0">
                Search
              </Button>
            </form>

            {/* Trending */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-xs tracking-widest uppercase text-[var(--color-brand-slate)]">Trending:</span>
              {sectors.map(s => (
                <Link key={s} to="/firms" search={{ sector: s, q: '', location: '' }} className="text-sm text-[var(--color-brand-navy)] underline decoration-[var(--color-brand-gold)]/40 hover:decoration-[var(--color-brand-gold)] transition-all">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Firms */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-2">Highlighted</p>
              <h2 className="font-serif text-3xl text-[var(--color-brand-navy)]">Featured Firms</h2>
            </div>
            <Link to="/firms" className="text-xs tracking-widest uppercase text-[var(--color-brand-slate)] hover:text-[var(--color-brand-navy)] underline transition-colors">
              Browse All →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {featured.map(firm => <FirmCard key={firm.id} firm={firm} />)}
          </div>
        </div>
      </section>

      {/* How Vetting Works */}
      <section className="py-20 px-6" id="vetting">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-3">Our Process</p>
            <h2 className="font-serif text-3xl text-[var(--color-brand-navy)]">How Vetting Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(step => (
              <div key={step.n} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)] flex items-center justify-center font-serif text-sm">{step.n}</div>
                <h3 className="font-serif text-xl text-[var(--color-brand-navy)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-brand-slate)] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-[var(--color-brand-navy)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-[var(--color-brand-cream)] mb-4">Ready to list your firm?</h2>
          <p className="text-[var(--color-brand-cream)]/70 mb-8 leading-relaxed">Join 400+ verified firms trusted by institutional buyers. The vetting process takes 7–10 business days.</p>
          <Button asChild variant="gold" size="lg" className="text-xs tracking-widest uppercase">
            <Link to="/submit">Submit Your Firm</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
