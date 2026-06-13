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

const categoryColors: Record<string, { zone: string; circle: string }> = {
  'Healthcare':    { zone: '#E8EFE4', circle: '#5B7A5C' },
  'Tech':          { zone: '#E6ECF5', circle: '#3B5998' },
  'Education':     { zone: '#F5EBE0', circle: '#8B5E3C' },
  'Legal':         { zone: '#EDE8F5', circle: '#5C4BA0' },
  'Food':          { zone: '#FEF3E2', circle: '#C07020' },
  'Finance':       { zone: '#E5F0EE', circle: '#2D7A6E' },
  'Real Estate':   { zone: '#F0EDE8', circle: '#7B5E45' },
  'Retail':        { zone: '#F5ECE8', circle: '#9B4B2E' },
  'Entertainment': { zone: '#F0E8F5', circle: '#7A4BA0' },
  'Services':      { zone: '#EEF0F5', circle: '#4A5568' },
}
const fallbackColors = { zone: '#E8EFE4', circle: '#5B7A5C' }

function stars(r: number) {
  return '★ ' + r.toFixed(1)
}

export default function BusinessCard({ business: b, isFavorited, onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName
  const colors = categoryColors[b.category] ?? fallbackColors

  return (
    <div
      className={`biz-card${b.pro ? ' pro-card' : ''}`}
      onClick={() => onSelect(b)}
    >
      {b.pro && <span className="pro-badge">PRO</span>}

      <div className="card-avatar-zone" style={{ background: colors.zone }}>
        {b.logoUrl ? (
          <img
            src={b.logoUrl}
            alt={b.businessName}
            className="card-avatar-img"
          />
        ) : (
          <div className="card-avatar-placeholder">
            <i className="ti ti-building-store" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="card-details">
        <div className="biz-name">{displayName}</div>
        {lang === 'ta' && b.nameTamil && (
          <div className="biz-name-tamil">{b.businessName}</div>
        )}
        <div className="biz-category">{b.category}</div>
        <div className="biz-location">
          {b.city}{b.women ? ' · Women-led' : ''}
        </div>

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
