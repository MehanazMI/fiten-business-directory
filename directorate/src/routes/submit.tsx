import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/submit')({
  component: SubmitPage,
})

const sectors = ['Legal', 'Consulting', 'Finance', 'Accounting', 'Human Resources', 'Insurance', 'Technology', 'Other']
const sizes = ['1–9', '10–49', '50–200', '200+']

function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', hq: '', sector: '', size: '', contactName: '', contactEmail: '', summary: '' })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="grid grid-cols-12 gap-12">
          {/* Left: explanation */}
          <div className="col-span-12 md:col-span-4">
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-4">Listing Application</p>
            <h1 className="font-serif text-4xl text-[var(--color-brand-navy)] mb-6">Submit Your Firm</h1>
            <p className="text-[var(--color-brand-slate)] leading-relaxed mb-8">Applications are reviewed by our editorial team within 7–10 business days. All principals and references are independently verified before listing.</p>
            <div className="space-y-5">
              {['Submit your firm details and credentials below.', 'Our team contacts references and verifies regulatory standing.', 'Approved firms receive a verified badge and profile page.', 'Status is renewed annually with a compliance check.'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)] flex items-center justify-center text-xs font-serif flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-[var(--color-brand-navy)]/80">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-[var(--color-brand-navy)] rounded-md p-10 text-[var(--color-brand-cream)]">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} className="text-[var(--color-brand-gold)] mx-auto mb-6" />
                  <h2 className="font-serif text-2xl mb-3">Application Received</h2>
                  <p className="text-[var(--color-brand-cream)]/70 leading-relaxed">Thank you for submitting {form.name || 'your firm'}. Our team will be in touch within 7–10 business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h2 className="font-serif text-xl mb-6 text-[var(--color-brand-gold)]">Firm Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Legal Firm Name *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] placeholder:text-white/30 outline-none focus:border-[var(--color-brand-gold)]" placeholder="e.g. Sterling & Richmond LLP" />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Headquarters *</label>
                        <input required value={form.hq} onChange={e => set('hq', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] placeholder:text-white/30 outline-none focus:border-[var(--color-brand-gold)]" placeholder="City, State" />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Primary Sector *</label>
                        <select required value={form.sector} onChange={e => set('sector', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] outline-none focus:border-[var(--color-brand-gold)]">
                          <option value="" className="text-[var(--color-brand-navy)]">Select sector…</option>
                          {sectors.map(s => <option key={s} value={s} className="text-[var(--color-brand-navy)]">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Firm Size *</label>
                        <select required value={form.size} onChange={e => set('size', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] outline-none focus:border-[var(--color-brand-gold)]">
                          <option value="" className="text-[var(--color-brand-navy)]">Select size…</option>
                          {sizes.map(s => <option key={s} value={s} className="text-[var(--color-brand-navy)]">{s} employees</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl mb-6 text-[var(--color-brand-gold)]">Primary Contact</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Contact Name *</label>
                        <input required value={form.contactName} onChange={e => set('contactName', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] placeholder:text-white/30 outline-none focus:border-[var(--color-brand-gold)]" placeholder="Full name" />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-[var(--color-brand-cream)]/60 block mb-2">Email *</label>
                        <input required type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] placeholder:text-white/30 outline-none focus:border-[var(--color-brand-gold)]" placeholder="contact@firm.com" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl mb-6 text-[var(--color-brand-gold)]">Executive Summary</h2>
                    <textarea required value={form.summary} onChange={e => set('summary', e.target.value)} rows={5} className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-sm text-[var(--color-brand-cream)] placeholder:text-white/30 outline-none focus:border-[var(--color-brand-gold)] resize-none" placeholder="Describe your firm's primary areas of practice, notable clients (without names), and what distinguishes your service…" />
                  </div>

                  <div>
                    <h2 className="font-serif text-xl mb-4 text-[var(--color-brand-gold)]">Document Upload</h2>
                    <div className="border-2 border-dashed border-white/20 rounded p-8 text-center">
                      <p className="text-sm text-[var(--color-brand-cream)]/60 mb-2">Drag & drop credentials, bar admission, or reference letters</p>
                      <p className="text-xs text-[var(--color-brand-cream)]/40">PDF, DOCX up to 10MB · Documents are handled confidentially</p>
                    </div>
                  </div>

                  <Button type="submit" variant="gold" size="lg" className="w-full text-xs tracking-widest uppercase">
                    Submit Application
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
