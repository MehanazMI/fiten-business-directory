import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import { oppLabels, sigClass } from '@/lib/utils'

interface Props {
  business: Business | null
  lang: Lang
  onClose: () => void
  onClaim: (name: string) => void
}

function stars(r: number) {
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(r) ? '★' : '☆')).join('')
}

export default function BusinessModal({ business: b, lang, onClose, onClaim }: Props) {
  if (!b) return null

  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName

  return (
    <div className="detail-overlay open" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>×</button>

        <div className="detail-header">
          <div
            className="detail-avatar-lg"
            style={{ background: b.pro ? 'var(--stone-dark)' : '#A8A29E', color: '#fff' }}
          >
            {b.initials}
          </div>
          <div>
            <div className="detail-name">{displayName}</div>
            {lang === 'ta' && b.nameTamil && (
              <div className="detail-name-sub">{b.businessName}</div>
            )}
            <div className="detail-cat-loc">{b.category} · 📍 {b.city}</div>
            {b.pro && (
              <span className="pro-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>PRO</span>
            )}
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-sec">About</div>
          <div className="detail-desc">{b.description}</div>

          {b.website && (
            <div className="detail-info-row">
              <span className="detail-icon">🌐</span>
              <a href={b.website} target="_blank" rel="noopener noreferrer">{b.website}</a>
            </div>
          )}

          {(b.looking.length > 0 || b.speaker || b.women || b.convention) && (
            <>
              <div className="detail-sec">B2B Signals</div>
              <div className="b2b-signals" style={{ padding: 0, marginBottom: '0.8rem' }}>
                {b.looking.map(l => (
                  <span key={l} className={`b2b-signal ${sigClass[l]}`}>{oppLabels[l]}</span>
                ))}
                {b.speaker && <span className="b2b-signal sig-speaker">🎤 Speaker</span>}
                {b.women && <span className="b2b-signal sig-women">♀ Women-Led</span>}
                {b.convention && <span className="b2b-signal sig-convention">🎉 FeTNA Conv.</span>}
              </div>
            </>
          )}

          {b.pro && (
            <>
              <div className="detail-sec">Reviews</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem' }}>
                <span className="rating-stars">{stars(b.rating)}</span>
                <strong>{b.rating}</strong>
                <span style={{ color: 'var(--text3)' }}>({b.reviews})</span>
              </div>
            </>
          )}
        </div>

        <div className="detail-footer">
          {b.pro ? (
            <button className="detail-connect-btn" onClick={onClose}>Connect</button>
          ) : (
            <button className="detail-connect-btn" onClick={() => { onClaim(b.businessName); onClose() }}>
              Claim Listing
            </button>
          )}
          <button className="detail-share-btn" onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/directory/${b.id}`)
          }}>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
