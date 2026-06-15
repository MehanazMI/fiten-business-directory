import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Button } from '@/components/ui/button'
import { firms } from '@/data/firms'
import { BadgeCheck, Star, MapPin, Users, Languages } from 'lucide-react'

export const Route = createFileRoute('/firms/$slug')({
  loader: ({ params }) => {
    const firm = firms.find(f => f.slug === params.slug)
    if (!firm) throw notFound()
    return firm
  },
  component: FirmDetailPage,
})

function FirmDetailPage() {
  const firm = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Cover */}
      <div className="h-64 bg-gradient-to-br from-[var(--color-brand-navy)] to-[var(--color-brand-navy)]/80 relative">
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-2">Featured Profile</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center">
                <span className="font-serif text-lg text-white font-bold">{firm.monogram}</span>
              </div>
              <div>
                <h1 className="font-serif text-3xl text-white flex items-center gap-3">
                  {firm.name}
                  {firm.verified && <BadgeCheck size={22} className="text-[var(--color-brand-gold)]" />}
                </h1>
                <p className="text-white/70 text-sm mt-1">{firm.sector} · {firm.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Main content */}
          <div className="col-span-12 md:col-span-8 space-y-10">
            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-navy)] mb-4">Overview</h2>
              <p className="text-[var(--color-brand-navy)]/80 leading-relaxed">{firm.blurb}</p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <section>
                <h2 className="font-serif text-xl text-[var(--color-brand-navy)] mb-4">Core Services</h2>
                <ul className="space-y-2">
                  {firm.services.map(s => (
                    <li key={s} className="flex items-center gap-2 text-sm text-[var(--color-brand-navy)]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-gold)] flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="font-serif text-xl text-[var(--color-brand-navy)] mb-4">Firm Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-[var(--color-brand-navy)]/80"><MapPin size={14} className="text-[var(--color-brand-slate)]" /> {firm.location}</div>
                  <div className="flex items-center gap-2 text-[var(--color-brand-navy)]/80"><Users size={14} className="text-[var(--color-brand-slate)]" /> {firm.size} employees</div>
                  <div className="flex items-center gap-2 text-[var(--color-brand-navy)]/80"><Languages size={14} className="text-[var(--color-brand-slate)]" /> {firm.languages.join(', ')}</div>
                  <div className="flex items-center gap-2 text-[var(--color-brand-navy)]/80">
                    <Star size={14} className="text-[var(--color-brand-gold)] fill-[var(--color-brand-gold)]" />
                    {firm.rating} · {firm.reviewCount} reviews
                  </div>
                </div>
              </section>
            </div>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-navy)] mb-6">Leadership</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {firm.leadership.map(l => (
                  <div key={l.name} className="bg-white border border-[var(--color-brand-navy)]/5 rounded-md p-5">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-navy)]/10 flex items-center justify-center mb-3">
                      <span className="font-serif text-sm text-[var(--color-brand-navy)] font-bold">
                        {l.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </span>
                    </div>
                    <p className="font-serif text-base text-[var(--color-brand-navy)]">{l.name}</p>
                    <p className="text-xs text-[var(--color-brand-slate)] mt-0.5">{l.title}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-navy)] mb-6">Client Testimonials</h2>
              {firm.testimonials.map(t => (
                <blockquote key={t.author} className="border-l-2 border-[var(--color-brand-gold)] pl-6 py-2">
                  <p className="text-[var(--color-brand-navy)]/80 italic leading-relaxed mb-3">"{t.text}"</p>
                  <footer className="text-xs text-[var(--color-brand-slate)] tracking-wide">— {t.author}, {t.role}</footer>
                </blockquote>
              ))}
            </section>
          </div>

          {/* Sticky claim card */}
          <div className="col-span-12 md:col-span-4">
            <div className="sticky top-24 bg-[var(--color-brand-navy)] rounded-md p-8 text-[var(--color-brand-cream)]">
              {firm.verified && (
                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-6">
                  <BadgeCheck size={14} /> Verified Firm
                </div>
              )}
              <h3 className="font-serif text-xl mb-2">Is this your firm?</h3>
              <p className="text-sm text-[var(--color-brand-cream)]/70 mb-6 leading-relaxed">Claim this listing to respond to reviews, update your profile, and access premium placement.</p>
              <Button variant="gold" className="w-full text-xs tracking-widest uppercase mb-3">
                Claim This Firm
              </Button>
              <Button asChild variant="outline" className="w-full text-xs tracking-widest uppercase border-[var(--color-brand-cream)]/20 text-[var(--color-brand-cream)] hover:bg-[var(--color-brand-cream)]/10 hover:text-[var(--color-brand-cream)]">
                <Link to="/submit">Submit Updates</Link>
              </Button>
              <div className="mt-8 pt-8 border-t border-[var(--color-brand-cream)]/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-cream)]/60">Rating</span>
                  <span className="font-medium">{firm.rating} / 5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-cream)]/60">Reviews</span>
                  <span className="font-medium">{firm.reviewCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-cream)]/60">Sector</span>
                  <span className="font-medium">{firm.sector}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
