'use client'

import { useState } from 'react'
import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import { categoryIcon, categoryColor, buildSignals } from '@/lib/business-meta'

interface Props {
  business: Business | null
  lang: Lang
  onClose: () => void
  onClaim: (name: string) => void
}

function waPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export default function BusinessModal({ business: b, lang, onClose, onClaim }: Props) {
  const [copied, setCopied] = useState(false)

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

  const icon = categoryIcon(b.category)
  const iconColor = categoryColor(b.category)
  const signals = buildSignals(b, { includeConvention: true })

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
              {b.city && <><span className="meta-dot">·</span><i className="ti ti-map-pin" aria-hidden="true" /> {b.city}</>}
              {b.employeeCount && <><span className="meta-dot">·</span><span>{b.employeeCount}</span></>}
              {b.founded && <><span className="meta-dot">·</span><span>Est. {b.founded}</span></>}
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

          {(b.phone || b.website || b.linkedin || b.instagram || b.twitter) && <div className="detail-sec">Contact</div>}
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
          {b.linkedin && (
            <div className="detail-info-row">
              <i className="ti ti-brand-linkedin detail-icon" aria-hidden="true" />
              <a href={b.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          )}
          {b.instagram && (
            <div className="detail-info-row">
              <i className="ti ti-brand-instagram detail-icon" aria-hidden="true" />
              <a href={b.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          )}
          {b.twitter && (
            <div className="detail-info-row">
              <i className="ti ti-brand-twitter detail-icon" aria-hidden="true" />
              <a href={b.twitter} target="_blank" rel="noopener noreferrer">Twitter / X</a>
            </div>
          )}

          {signals.length > 0 && (
            <>
              <div className="detail-sec">Open to</div>
              <div className="b2b-signals" style={{ marginBottom: '0.4rem' }}>
                {signals.map((s, i) => (
                  <span key={s.label} className="b2b-signal">
                    {i > 0 && <span className="sig-sep">·</span>}
                    <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}

          {b.pro && b.reviews > 0 && (
            <>
              <div className="detail-sec">Reviews</div>
              <div className="detail-rating">
                <i className="ti ti-star" aria-hidden="true" />
                <strong>{b.rating}</strong>
                <span>· {b.reviews} reviews</span>
              </div>
            </>
          )}
        </div>

        <div className="detail-footer">
          {b.pro ? (
            <button className="detail-connect-btn" onClick={handleConnect}>
              <i className={`ti ${b.phone ? 'ti-brand-whatsapp' : 'ti-mail'}`} aria-hidden="true" />
              {b.phone ? 'WhatsApp' : 'Email'}
            </button>
          ) : (
            <button className="detail-connect-btn" onClick={() => { onClaim(b.businessName); onClose() }}>
              Claim Listing
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
