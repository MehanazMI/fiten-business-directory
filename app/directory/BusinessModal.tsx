'use client'

import { useState } from 'react'
import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import { categoryIcon, categoryColor, buildB2BSignals, buildCommunityBadges } from '@/lib/business-meta'

interface Props {
  business: Business | null
  lang: Lang
  onClose: () => void
  onClaim: (id: string, name: string) => void
  isOwner?: boolean
}

function waPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function mapsQuery(b: Business) {
  const parts = [b.city, b.country].filter(Boolean)
  return encodeURIComponent(parts.join(', '))
}

export default function BusinessModal({ business: b, lang, onClose, onClaim, isOwner = false }: Props) {
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [reportSending, setReportSending] = useState(false)

  if (!b) return null

  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/directory/${b.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const connectMsg = `Hi ${b.businessName}, I found you on FiTEN Directory and would like to connect.`

  const handleConnect = () => {
    if (b.phone) {
      window.open(`https://wa.me/${waPhone(b.phone)}?text=${encodeURIComponent(connectMsg)}`, '_blank')
    } else {
      const subject = encodeURIComponent('FiTEN Directory – Connection Request')
      const body = encodeURIComponent(`${connectMsg}\n\n---\nSent via FiTEN Business Directory · fiten-business-directory.vercel.app`)
      window.location.href = `mailto:${b.email}?subject=${subject}&body=${body}`
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return
    setReportSending(true)
    try {
      await fetch('/api/report-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: b.id, businessName: b.businessName, reason: reportReason.trim() }),
      })
      setReportSent(true)
    } finally {
      setReportSending(false)
    }
  }

  const icon = categoryIcon(b.category)
  const iconColor = categoryColor(b.category)
  const b2bSignals = buildB2BSignals(b)
  const communityBadges = buildCommunityBadges(b, { includePro: true })
  const hasLocation = !!(b.city)

  return (
    <div className="detail-overlay open" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true" />
        </button>

        <div className="detail-header">
          <div className="detail-avatar-lg">
            {b.logoUrl
              ? <img src={b.logoUrl} alt={b.businessName} className="card-logo-img" />
              : <i className={`ti ${icon}`} style={{ color: iconColor }} aria-hidden="true" />}
          </div>
          <div>
            <div className="detail-name">{displayName}</div>
            {lang === 'ta' && b.nameTamil && (
              <div className="detail-name-sub">{b.businessName}</div>
            )}
            <div className="detail-cat-loc">
              {b.category}
              {b.city && <><span className="meta-dot">·</span><i className="ti ti-map-pin" aria-hidden="true" /> {b.city}{b.country ? `, ${b.country}` : ''}</>}
            </div>
            {(b.pro || b.verified) && (
              <div className="detail-badges">
                {b.pro && <span className="pro-badge"><i className="ti ti-rosette" /> FeTNA Sponsor</span>}
                {b.verified && <span className="verified-badge"><i className="ti ti-circle-check" /> Verified</span>}
              </div>
            )}
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-sec">About</div>
          <div className="detail-desc">{b.description}</div>

          {b.services && b.services.length > 0 && (
            <>
              <div className="detail-sec">What we do</div>
              <div className="detail-services">
                {b.services.map(s => <span key={s} className="detail-svc-chip">{s}</span>)}
              </div>
            </>
          )}

          <div className="detail-sec">Contact</div>
          {b.phone && (
            <div className="detail-info-row">
              <i className="ti ti-phone detail-icon" aria-hidden="true" />
              <span>{b.phone}</span>
            </div>
          )}
          <div className="detail-info-row">
            <i className="ti ti-mail detail-icon" aria-hidden="true" />
            <a href={`mailto:${b.email}`}>{b.email}</a>
          </div>
          {b.website && (
            <div className="detail-info-row">
              <i className="ti ti-world detail-icon" aria-hidden="true" />
              <a href={b.website} target="_blank" rel="noopener noreferrer">
                {b.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Google Maps embed for physical businesses */}
          {hasLocation && (
            <div className="detail-map">
              <iframe
                title={`${b.businessName} location`}
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '8px', marginTop: '0.75rem' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapsQuery(b)}&output=embed`}
              />
            </div>
          )}

          {b.views > 0 && (
            <div className="detail-stat">
              <i className="ti ti-eye" aria-hidden="true" />
              <span>{b.views} visits</span>
            </div>
          )}

          {b2bSignals.length > 0 && (
            <>
              <div className="detail-sec">Looking for</div>
              <div className="b2b-signals" style={{ marginBottom: '0.4rem' }}>
                {b2bSignals.map((s, i) => (
                  <span key={s.label} className="b2b-signal">
                    {i > 0 && <span className="sig-sep">·</span>}
                    <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}

          {communityBadges.length > 0 && (
            <>
              <div className="detail-sec">Community</div>
              <div className="b2b-signals" style={{ marginBottom: '0.4rem' }}>
                {communityBadges.map((s, i) => (
                  <span key={s.label} className="b2b-signal">
                    {i > 0 && <span className="sig-sep">·</span>}
                    <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Report listing */}
          {!reportOpen && !reportSent && (
            <button
              className="detail-report-btn"
              onClick={() => setReportOpen(true)}
            >
              <i className="ti ti-flag" aria-hidden="true" /> Report this listing
            </button>
          )}
          {reportOpen && !reportSent && (
            <div className="detail-report-box">
              <div className="detail-sec" style={{ marginBottom: '0.5rem' }}>Report listing</div>
              <textarea
                className="detail-report-textarea"
                placeholder="Describe the issue — inaccurate info, spam, duplicate, etc."
                rows={3}
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="detail-connect-btn"
                  style={{ flex: 1 }}
                  onClick={handleReport}
                  disabled={reportSending || !reportReason.trim()}
                >
                  {reportSending ? 'Sending…' : 'Submit Report'}
                </button>
                <button className="detail-share-btn" onClick={() => setReportOpen(false)}>Cancel</button>
              </div>
            </div>
          )}
          {reportSent && (
            <p className="detail-report-sent">
              <i className="ti ti-circle-check" /> Report received — thank you.
            </p>
          )}

        </div>

        <div className="detail-footer">
          <button className="detail-connect-btn" onClick={handleConnect}>
            <i className={`ti ${b.phone ? 'ti-brand-whatsapp' : 'ti-mail'}`} aria-hidden="true" />
            {b.phone ? 'WhatsApp' : 'Email'}
          </button>
          {!isOwner && (
            <button className="detail-share-btn" onClick={() => { onClaim(b.id, b.businessName); onClose() }}>
              Claim
            </button>
          )}
          <button className="detail-share-btn" onClick={handleShare}>
            {copied ? 'Copied ✓' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
