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
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(r) ? '★' : '☆')).join('')
}

export default function BusinessCard({ business: b, isFavorited, onSelect, onFavorite, lang }: Props) {
  const displayName = lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName

  return (
    <div
      className={`biz-card${b.pro ? ' pro-card' : ''}`}
      onClick={() => onSelect(b)}
    >
      <div className="card-top">
        <div className="biz-avatar" style={{ background: '#E2E5EA', color: 'var(--stone-dark)' }}>
          {b.initials}
        </div>
        <div className="biz-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="biz-name">{displayName}</div>
            {b.pro && <span className="pro-badge">PRO</span>}
          </div>
          {lang === 'ta' && b.nameTamil && (
            <div className="biz-name-tamil">{b.businessName}</div>
          )}
          <div className="biz-category">{b.category}</div>
          <div className="biz-location">📍 {b.city}</div>
        </div>
        <button
          className={`fav-btn${isFavorited ? ' favd' : ''}`}
          onClick={e => { e.stopPropagation(); onFavorite(b.id) }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="b2b-signals">
        {b.looking.map(l => (
          <span key={l} className={`b2b-signal ${sigClass[l]}`}>{oppLabels[l]}</span>
        ))}
        {b.speaker && <span className="b2b-signal sig-speaker">🎤 Speaker</span>}
        {b.women && <span className="b2b-signal sig-women">♀ Women-Led</span>}
        {b.convention && <span className="b2b-signal sig-convention">🎉 FeTNA Conv.</span>}
      </div>

      <div className="card-desc">{b.description}</div>

      <div className="card-footer" onClick={e => e.stopPropagation()}>
        <span className="card-rating">
          <span className="rating-stars">{stars(b.rating)}</span>
          {' '}{b.rating} · {b.reviews}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="connect-btn" onClick={() => onSelect(b)}>View</button>
          {!b.pro && (
            <button className="profile-btn" onClick={e => e.stopPropagation()}>PRO</button>
          )}
        </div>
      </div>
    </div>
  )
}
