'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Business } from '@/types/business'
import type { Connection } from '@/types/connection'
import { postConnection } from '@/lib/firestore-rest'
import { colors, textColors } from '@/lib/utils'

type OppType = 'partner' | 'client' | 'invest' | 'hire' | 'mentor'
type VisitorRole = 'all' | OppType

const OPP_META: Record<OppType, { label: string; icon: string; desc: string; color: string }> = {
  partner:  { label: 'Partnership',    icon: 'ti-heart-handshake', desc: 'Open to strategic partnerships & collaborations', color: '#7C3AED' },
  client:   { label: 'New Clients',    icon: 'ti-users',           desc: 'Actively seeking new clients & customers',        color: '#059669' },
  invest:   { label: 'Investment',     icon: 'ti-chart-line',      desc: 'Open to investors & funding opportunities',       color: '#C5A059' },
  hire:     { label: 'Hiring',         icon: 'ti-briefcase',       desc: 'Currently hiring talent',                         color: '#2563EB' },
  mentor:   { label: 'Mentorship',     icon: 'ti-user-star',       desc: 'Open to mentoring community members',             color: '#0284C7' },
}

const ROLE_FILTERS: { value: VisitorRole; label: string; icon: string }[] = [
  { value: 'all',     label: 'All Opportunities', icon: 'ti-layout-grid' },
  { value: 'partner', label: 'Find Partners',     icon: 'ti-heart-handshake' },
  { value: 'client',  label: 'Find Clients',      icon: 'ti-users' },
  { value: 'invest',  label: 'Invest',            icon: 'ti-chart-line' },
  { value: 'hire',    label: 'Find Talent',       icon: 'ti-briefcase' },
  { value: 'mentor',  label: 'Find Mentors',      icon: 'ti-user-star' },
]

const SECTOR_FILTERS = ['All Sectors', 'Tech', 'Healthcare', 'Finance', 'Education', 'Food', 'Legal', 'Retail', 'Services']

function OpportunityCard({
  b, onView, isRequestOpen, onRequestToggle,
}: {
  b: Business
  onView: () => void
  isRequestOpen: boolean
  onRequestToggle: () => void
}) {
  const bg = colors[b.colorIdx % colors.length]
  const fg = textColors[b.colorIdx % textColors.length]
  const [form, setForm] = useState({ name: '', email: '', business: '', type: (b.looking[0] ?? 'client') as Connection['type'], message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [reqError, setReqError] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 20) return
    setSubmitting(true)
    setReqError('')
    try {
      await postConnection({
        fromName: form.name.trim(),
        fromEmail: form.email.trim(),
        fromBusiness: form.business.trim() || undefined,
        toBusinessId: b.id,
        toBusinessName: b.businessName,
        type: form.type,
        message: form.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      setDone(true)
    } catch (err) {
      setReqError(err instanceof Error ? err.message : 'Failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="connect-card" onClick={isRequestOpen ? undefined : onView}>
      <div className="connect-card-top">
        {b.logoUrl ? (
          <img src={b.logoUrl} alt={b.businessName} className="connect-card-logo" />
        ) : (
          <div className="connect-card-initials" style={{ background: bg, color: fg }}>{b.initials}</div>
        )}
        <div className="connect-card-info">
          <div className="connect-card-name">
            {b.businessName}
            {b.pro && <span className="connect-card-pro">PRO</span>}
            {b.women && <span className="connect-card-badge">WOB</span>}
          </div>
          <div className="connect-card-meta">{b.category} · {b.city}</div>
        </div>
      </div>

      <p className="connect-card-desc">{b.description}</p>

      <div className="connect-card-opps">
        {b.looking.map(opp => (
          <span key={opp} className="connect-opp-pill" style={{ background: OPP_META[opp].color + '18', color: OPP_META[opp].color, borderColor: OPP_META[opp].color + '40' }}>
            <i className={`ti ${OPP_META[opp].icon}`} />
            {OPP_META[opp].label}
          </span>
        ))}
      </div>

      <div className="connect-card-actions">
        {b.email && (
          <a className="connect-action-btn connect-action-email" href={`mailto:${b.email}?subject=Connecting via FiTEN`} onClick={e => e.stopPropagation()}>
            <i className="ti ti-mail" /> Email
          </a>
        )}
        {b.website && (
          <a className="connect-action-btn connect-action-web" href={b.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <i className="ti ti-external-link" /> Website
          </a>
        )}
        <button className="connect-action-btn connect-action-view" onClick={e => { e.stopPropagation(); onView() }}>
          View Profile
        </button>
        <button
          className={`connect-action-btn connect-action-req${isRequestOpen ? ' active' : ''}`}
          onClick={e => { e.stopPropagation(); onRequestToggle() }}
        >
          <i className="ti ti-send" /> Send Request
        </button>
      </div>

      {isRequestOpen && (
        <div className="connect-req-form" onClick={e => e.stopPropagation()}>
          {done ? (
            <div className="connect-req-success">
              <i className="ti ti-circle-check" aria-hidden="true" />
              Request sent to <strong>{b.businessName}</strong>. They will reach out to you directly.
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <div className="connect-req-label">Connection request</div>
              <div className="connect-req-row">
                <input className="connect-req-input" placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <input className="connect-req-input" type="email" placeholder="Your email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <input className="connect-req-input" placeholder="Your business (optional)" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} />
              {b.looking.length > 1 && (
                <select className="connect-req-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Connection['type'] }))}>
                  {b.looking.map(op => <option key={op} value={op}>{OPP_META[op].label}</option>)}
                </select>
              )}
              <textarea
                className="connect-req-input"
                rows={3}
                placeholder={`Message to ${b.businessName} (min 20 chars) *`}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
                minLength={20}
              />
              {reqError && <div className="connect-req-error">{reqError}</div>}
              <button className="connect-req-submit" type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : <><i className="ti ti-send" aria-hidden="true" /> Send</>}
              </button>
              <button type="button" className="connect-req-cancel" onClick={onRequestToggle}>cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default function ConnectClient({ businesses }: { businesses: Business[] }) {
  const router = useRouter()
  const [role, setRole] = useState<VisitorRole>('all')
  const [sector, setSector] = useState('All Sectors')
  const [search, setSearch] = useState('')
  const [openRequestId, setOpenRequestId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return businesses
      .filter(b => b.status === 'active' && b.looking && b.looking.length > 0)
      .filter(b => role === 'all' || b.looking.includes(role as OppType))
      .filter(b => sector === 'All Sectors' || b.category === sector)
      .filter(b => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return b.businessName.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)
      })
      .sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0))
  }, [businesses, role, sector, search])

  // Counts per opportunity type
  const counts = useMemo(() => {
    const active = businesses.filter(b => b.status === 'active' && b.looking?.length > 0)
    return {
      partner: active.filter(b => b.looking.includes('partner')).length,
      client:  active.filter(b => b.looking.includes('client')).length,
      invest:  active.filter(b => b.looking.includes('invest')).length,
      hire:    active.filter(b => b.looking.includes('hire')).length,
    }
  }, [businesses])

  return (
    <div className="connect-page">
      {/* Hero */}
      <section className="connect-hero">
        <div className="connect-hero-inner">
          <div className="connect-hero-badge">
            <span className="connect-hero-dot" />
            Live Opportunities
          </div>
          <h1 className="connect-hero-title">
            Tamil business, <em>connected.</em>
          </h1>
          <p className="connect-hero-sub">
            Browse businesses actively seeking partners, clients, investors, talent, and mentors.
            One community — infinite possibilities.
          </p>

          {/* Stats row */}
          <div className="connect-stats">
            {(Object.entries(counts) as [OppType, number][]).map(([type, count]) => (
              <button key={type} className={`connect-stat-pill${role === type ? ' active' : ''}`} onClick={() => setRole(role === type ? 'all' : type)}>
                <i className={`ti ${OPP_META[type].icon}`} style={{ color: OPP_META[type].color }} />
                <span className="connect-stat-count">{count}</span>
                <span className="connect-stat-label">{OPP_META[type].label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="connect-filters-bar">
        <div className="connect-filters-inner">
          <div className="connect-role-chips">
            {ROLE_FILTERS.map(f => (
              <button key={f.value} className={`connect-chip${role === f.value ? ' active' : ''}`} onClick={() => setRole(f.value)}>
                <i className={`ti ${f.icon}`} />
                {f.label}
              </button>
            ))}
          </div>
          <div className="connect-filter-right">
            <select className="connect-sector-select" value={sector} onChange={e => setSector(e.target.value)}>
              {SECTOR_FILTERS.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="connect-search-wrap">
              <i className="ti ti-search connect-search-icon" />
              <input
                className="connect-search-input"
                type="text"
                placeholder="Search businesses…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="connect-results">
        <div className="connect-results-header">
          <span className="connect-results-count">{filtered.length} {filtered.length === 1 ? 'business' : 'businesses'} found</span>
        </div>

        {filtered.length === 0 ? (
          <div className="connect-empty">
            <i className="ti ti-mood-empty connect-empty-icon" />
            <div className="connect-empty-title">No matches yet</div>
            <div className="connect-empty-sub">Try a different filter or <a href="/form">add your business</a> to the network</div>
          </div>
        ) : (
          <div className="connect-grid">
            {filtered.map(b => (
              <OpportunityCard
                key={b.id}
                b={b}
                onView={() => router.push(`/directory/${b.id}`)}
                isRequestOpen={openRequestId === b.id}
                onRequestToggle={() => setOpenRequestId(id => id === b.id ? null : b.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA band */}
      <section className="connect-cta-band">
        <div className="connect-cta-inner">
          <h2 className="connect-cta-title">Ready to grow your network?</h2>
          <p className="connect-cta-sub">List your business and start receiving connection requests from the Tamil business community.</p>
          <div className="connect-cta-btns">
            <a href="/form" className="home-btn-gold">Add Your Business</a>
            <a href="/directory" className="home-btn-ghost">Browse Directory</a>
          </div>
        </div>
      </section>
    </div>
  )
}
