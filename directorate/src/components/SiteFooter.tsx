import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)]/60 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <p className="font-serif text-2xl text-[var(--color-brand-cream)] tracking-widest uppercase mb-3">Directorate</p>
            <p className="text-sm leading-relaxed max-w-sm">The verified professional services directory for institutional buyers seeking vetted counsel, advisory, and expertise.</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-4">Directory</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/firms" className="hover:text-[var(--color-brand-cream)] transition-colors">Browse Firms</Link></li>
              <li><Link to="/submit" className="hover:text-[var(--color-brand-cream)] transition-colors">Submit a Firm</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--color-brand-gold)] mb-4">Company</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[var(--color-brand-cream)] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-cream)] transition-colors">Vetting Standards</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-cream)] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-brand-cream)]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-widest uppercase">© 2026 Directorate. All rights reserved.</p>
          <p className="text-xs tracking-widest uppercase">Privacy · Terms</p>
        </div>
      </div>
    </footer>
  )
}
