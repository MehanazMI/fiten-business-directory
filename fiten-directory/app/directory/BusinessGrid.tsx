import type { Business } from '@/types/business'
import type { Lang } from '@/lib/utils'
import BusinessCard from './BusinessCard'
import WorldMap from '@/app/components/home/WorldMap'

interface Props {
  businesses: Business[]
  view: 'grid' | 'list' | 'map'
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

  if (view === 'map') {
    return (
      <div className="map-view-card">
        <WorldMap theme="light" />
        <div className="map-view-caption">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} · hover a pin for the city
        </div>
      </div>
    )
  }

  const gridClass = view === 'list' ? 'biz-grid-h' : 'biz-grid-v'

  return (
    <>
      <div className={gridClass}>
        {visible.map(b => (
          <BusinessCard
            key={b.id}
            business={b}
            view={view === 'list' ? 'list' : 'grid'}
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
