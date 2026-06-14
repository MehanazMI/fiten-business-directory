import type { Business } from '@/types/business'
import { oppLabels, sigClass } from '@/lib/utils'
import type { Lang } from '@/lib/utils'

interface Props {
  business: Business
  isFavorited: boolean
  onSelect: (b: Business) => void
  onFavorite: (id: string) => void
  lang: Lang
}

function stars(r: number) {
  return '★ ' + r.toFixed(1)
}

export default function BusinessCard({ business: b, isFavorited, onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName

  return (
    <div
      className={`biz-card${b.pro ? ' pro-card' : ''}`}
      onClick={() => onSelect(b)}
    >
      {b.pro && <span className="pro-badge">PRO</span>}

      {/* Monogram tile */}
      <div className="card-avatar-zone">
        {b.logoUrl ? (
          <img src={b.logoUrl} alt={b.businessName} className="card-avatar-img" />
        ) : (
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', letterSpacing: '0.02em' }}>
            {b.initials}
          </span>
        )}
      </div>

      <div className="card-details">
        <div className="biz-name">{displayName}</div>
        {lang === 'ta' && b.nameTamil && (
          <div className="biz-name-tamil">{b.businessName}</div>
        )}
        <div className="biz-category">{b.category} · {b.city}{b.women ? ' · Women-led' : ''}</div>

        {b.description && (
          <div className="card-desc">{b.description}</div>
        )}

        {(b.looking.length > 0 || b.speaker || b.convention) && (
          <div className="b2b-signals">
            {b.looking.map(l => (
              <span key={l} className={`b2b-signal ${sigClass[l]}`}>{oppLabels[l]}</span>
            ))}
            {b.speaker && <span className="b2b-signal sig-speaker">Speaker</span>}
            {b.convention && <span className="b2b-signal sig-convention">FeTNA Conv.</span>}
          </div>
        )}

        <div className="card-footer">
          <button
            className={`fav-btn${isFavorited ? ' favd' : ''}`}
            onClick={e => { e.stopPropagation(); onFavorite(b.id) }}
            aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
          >
            ♥
          </button>
          {b.reviews > 0 ? (
            <span className="card-rating">{stars(b.rating)} · {b.reviews} reviews</span>
          ) : (
            <span className="card-new-label">New listing</span>
          )}
        </div>
      </div>
    </div>
  )
}
