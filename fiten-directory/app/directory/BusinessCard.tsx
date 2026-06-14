import type { Business } from '@/types/business'
import { oppLabels } from '@/lib/utils'
import type { Lang } from '@/lib/utils'

interface Props {
  business: Business
  isFavorited: boolean
  view?: 'grid' | 'list'
  onSelect: (b: Business) => void
  onFavorite: (id: string) => void
  lang: Lang
}

const CAT_ICON: Record<string, string> = {
  'Healthcare':    'ti-heart-rate-monitor',
  'Tech':          'ti-cpu',
  'Education':     'ti-book',
  'Legal':         'ti-scale',
  'Food':          'ti-coffee',
  'Finance':       'ti-coin',
  'Real Estate':   'ti-home',
  'Retail':        'ti-shopping-bag',
  'Entertainment': 'ti-music',
  'Services':      'ti-tool',
}

function stars(r: number) {
  return r.toFixed(1)
}

export default function BusinessCard({ business: b, isFavorited, view = 'grid', onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName
  const icon = CAT_ICON[b.category] ?? 'ti-building'
  const isListView = view === 'list'

  return (
    <div
      className={`biz-card${b.pro ? ' pro-card' : ''}${isListView ? ' list-card' : ''}`}
      onClick={() => onSelect(b)}
    >
      <div className="card-header">
        <div className="card-initials">
          {b.logoUrl
            ? <img src={b.logoUrl} alt={b.businessName} className="card-logo-img" />
            : <i className={`ti ${icon}`} />
          }
        </div>
        <div className="card-header-text">
          <div className="biz-name">{displayName}</div>
          {lang === 'ta' && b.nameTamil && (
            <div className="biz-name-tamil">{b.businessName}</div>
          )}
          <div className="biz-meta">
            <i className={`ti ${icon} biz-cat-icon`} />
            <span>{b.category}</span>
            {b.city && <><span className="meta-dot">·</span><span className="biz-location">{b.city}</span></>}
            {b.women && (
              <span className="women-tag">
                <i className="ti ti-gender-female" />
                Women-led
              </span>
            )}
          </div>
        </div>
        {b.pro && (
          <span className="pro-badge">
            <i className="ti ti-crown" />
            PRO
          </span>
        )}
      </div>

      <div className="card-body">
        {b.description && (
          <div className="card-desc">{b.description}</div>
        )}

        {(b.looking.length > 0 || b.speaker || b.convention) && (
          <div className="b2b-signals">
            {b.looking.map(l => (
              <span key={l} className="b2b-signal">{oppLabels[l]}</span>
            ))}
            {b.speaker && <span className="b2b-signal">Speaker</span>}
            {b.convention && <span className="b2b-signal">FeTNA Conv.</span>}
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          className={`fav-btn${isFavorited ? ' favd' : ''}`}
          onClick={e => { e.stopPropagation(); onFavorite(b.id) }}
          aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
        >
          <i className={`ti ${isFavorited ? 'ti-heart-filled' : 'ti-heart'}`} />
        </button>
        {b.reviews > 0 ? (
          <span className="card-rating">
            <span className="rating-star">★</span>
            {stars(b.rating)} · {b.reviews} reviews
          </span>
        ) : (
          <span className="card-new-label">New listing</span>
        )}
      </div>
    </div>
  )
}
