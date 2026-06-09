import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import BusinessCard from './BusinessCard'

interface Props {
  businesses: Business[]
  view: 'grid' | 'region'
  visibleCount: number
  favorites: Set<string>
  lang: Lang
  onSelect: (b: Business) => void
  onFavorite: (id: string) => void
  onLoadMore: () => void
}

export default function BusinessGrid({
  businesses, view, visibleCount, favorites, lang, onSelect, onFavorite, onLoadMore,
}: Props) {
  const visible = businesses.slice(0, visibleCount)
  const remaining = businesses.length - visibleCount

  if (businesses.length === 0) {
    return (
      <div className="no-results visible">
        <div className="no-results-title">No businesses found</div>
        <div className="no-results-sub">Try adjusting your search or filters</div>
      </div>
    )
  }

  if (view === 'region') {
    const groups: Record<string, Business[]> = {}
    businesses.forEach(b => {
      const r = b.region || 'Other'
      if (!groups[r]) groups[r] = []
      groups[r].push(b)
    })
    return (
      <>
        {Object.entries(groups).map(([region, items]) => (
          <div key={region} className="region-section">
            <div className="region-heading">
              <span className="region-flag">🌍</span>
              {region}
              <span className="region-count">{items.length}</span>
            </div>
            <div className="region-list">
              {items.map(b => (
                <div
                  key={b.id}
                  className={`region-row${b.pro ? ' pro-row' : ''}`}
                  onClick={() => onSelect(b)}
                >
                  <div
                    className="region-avatar"
                    style={{ background: '#E2E5EA', color: 'var(--stone-dark)' }}
                  >
                    {b.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="region-name">
                      {lang === 'ta' && b.nameTamil ? b.nameTamil : b.businessName}
                    </div>
                    <div className="region-sub">{b.category} · {b.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <div className="biz-grid">
        {visible.map(b => (
          <BusinessCard
            key={b.id}
            business={b}
            isFavorited={favorites.has(b.id)}
            onSelect={onSelect}
            onFavorite={onFavorite}
            lang={lang}
          />
        ))}
      </div>

      {remaining > 0 && (
        <div className="load-more-wrap">
          <button className="load-more-btn" onClick={onLoadMore}>
            Load {Math.min(remaining, 6)} more
          </button>
          <div className="load-more-count">
            Showing {visibleCount} of {businesses.length}
          </div>
        </div>
      )}
    </>
  )
}
