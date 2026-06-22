import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'

interface Props {
  business: Business
  isFavorited: boolean
  view?: 'grid' | 'list'
  onSelect: (b: Business) => void
  onFavorite: (id: string) => void
  lang: Lang
}

export const CAT_ICON: Record<string, string> = {
  'Healthcare':    'ti-stethoscope',
  'Tech':          'ti-device-laptop',
  'Technology':    'ti-device-laptop',
  'Education':     'ti-school',
  'Legal':         'ti-scale',
  'Food':          'ti-tools-kitchen-2',
  'Food & Beverage': 'ti-tools-kitchen-2',
  'Finance':       'ti-coin',
  'Real Estate':   'ti-home',
  'Retail':        'ti-shopping-cart',
  'Entertainment': 'ti-music',
  'Services':      'ti-tool',
}

export const CAT_COLOR: Record<string, string> = {
  'Healthcare':      '#993556',
  'Tech':            '#185FA5',
  'Technology':      '#185FA5',
  'Education':       '#3B6D11',
  'Legal':           '#3C3489',
  'Food':            '#854F0B',
  'Food & Beverage': '#854F0B',
  'Finance':         '#0F6E56',
  'Real Estate':     '#185FA5',
  'Retail':          '#993556',
  'Entertainment':   '#3C3489',
  'Services':        '#0F6E56',
}

type SignalMeta = { icon: string; label: string; color: string }

const LOOKING_META: Record<string, SignalMeta> = {
  partner: { icon: 'ti-heart-handshake', label: 'Partner',        color: '#7C3AED' },
  client:  { icon: 'ti-users',       label: 'Seeking clients',    color: '#059669' },
  invest:  { icon: 'ti-chart-line',  label: 'Seeking investment', color: '#C5A059' },
  hire:    { icon: 'ti-briefcase',   label: 'Hiring',             color: '#2563EB' },
}

function stars(r: number) {
  return r.toFixed(1)
}

export default function BusinessCard({ business: b, isFavorited, view = 'grid', onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName
  const icon = CAT_ICON[b.category] ?? 'ti-building'
  const iconColor = CAT_COLOR[b.category] ?? 'var(--navy)'
  const isListView = view === 'list'

  const signals: SignalMeta[] = [
    ...(b.pro     ? [{ icon: 'ti-rosette',       label: 'FeTNA Sponsor', color: '#C5A059' }] : []),
    ...b.looking.map(l => LOOKING_META[l]).filter(Boolean),
    ...(b.women   ? [{ icon: 'ti-gender-female', label: 'Women-led', color: '#D4537E' }] : []),
    ...(b.speaker ? [{ icon: 'ti-microphone',    label: 'Speaker',   color: '#0284C7' }] : []),
  ]

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
        {b.reviews > 0 ? (
          <span className="card-rating">
            <i className="ti ti-star rating-star" />
            {stars(b.rating)} · {b.reviews} reviews
          </span>
        ) : (
          <span className="card-new-label">New listing</span>
        )}
      </div>
    </div>
  )
}
