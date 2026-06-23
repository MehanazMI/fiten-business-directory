import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import { categoryIcon, categoryColor, buildSignals } from '@/lib/business-meta'

export { CAT_ICON, CAT_COLOR } from '@/lib/business-meta'

interface Props {
  business: Business
  isFavorited: boolean
  view?: 'grid' | 'list'
  onSelect: (b: Business) => void
  onFavorite: (id: string) => void
  lang: Lang
}

export default function BusinessCard({ business: b, isFavorited, view = 'grid', onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName
  const icon = categoryIcon(b.category)
  const iconColor = categoryColor(b.category)
  const isListView = view === 'list'

  const signals = buildSignals(b, { includePro: true })

  return (
    <div
      className={`biz-card${b.pro ? ' pro-card' : ''}${isListView ? ' list-card' : ''}`}
      onClick={() => onSelect(b)}
    >
      <div className="card-header">
        <div className="card-initials">
          {b.logoUrl
            ? <img src={b.logoUrl} alt={b.businessName} className="card-logo-img" />
            : <i className={`ti ${icon}`} style={{ color: iconColor }} />
          }
        </div>
        <div className="card-header-text">
          <div className="biz-name">{displayName}</div>
          {lang === 'ta' && b.nameTamil && (
            <div className="biz-name-tamil">{b.businessName}</div>
          )}
          <div className="biz-meta">
            <span>{b.category}</span>
            {b.city && <><span className="meta-dot">·</span><span className="biz-location">{b.city}</span></>}
            {b.employeeCount && <><span className="meta-dot">·</span><span className="card-emp">{b.employeeCount} emp</span></>}
          </div>
        </div>
        {b.verified && (
          <span className="verified-badge" title="Business email and website verified by FiTEN"><i className="ti ti-circle-check" /> Verified</span>
        )}
      </div>

      <div className="card-body">
        {b.description && (
          <div className="card-desc">{b.description}</div>
        )}

        {b.services && b.services.length > 0 && (
          <div className="card-svc-chips">
            {b.services.slice(0, 3).map(s => (
              <span key={s} className="card-svc-chip">{s}</span>
            ))}
            {b.services.length > 3 && <span className="card-svc-chip card-svc-more">+{b.services.length - 3}</span>}
          </div>
        )}

        {signals.length > 0 && (
          <div className="b2b-signals">
            {signals.map((s, i) => (
              <span key={s.label} className="b2b-signal">
                {i > 0 && <span className="sig-sep">·</span>}
                <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                {s.label}
              </span>
            ))}
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
        {b.views > 0 ? (
          <span className="card-views">
            <i className="ti ti-eye" />
            {b.views} visits
          </span>
        ) : (
          <span className="card-new-label">New listing</span>
        )}
      </div>
    </div>
  )
}
