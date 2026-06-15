interface Props {
  activeFilter: string
  activeCat: string
  activeView: 'grid' | 'region'
  sort: string
  showFavs: boolean
  catCounts: Record<string, number>
  onFilterChange: (f: string) => void
  onCatChange: (c: string) => void
  onViewChange: (v: 'grid' | 'region') => void
  onSortChange: (s: string) => void
  onFavsToggle: () => void
}

const FILTERS = ['All', 'Pro']

export default function FilterRow({
  activeFilter, activeCat, activeView, sort, showFavs, catCounts,
  onFilterChange, onCatChange, onViewChange, onSortChange, onFavsToggle,
}: Props) {
  const topCats = Object.entries(catCounts)
    .filter(([cat]) => cat !== 'All')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat)

  return (
    <div className="filter-row">
      {FILTERS.map(f => (
        <button
          key={f}
          className={`pill${activeFilter === f && activeCat === 'All' ? ' active' : ''}`}
          onClick={() => { onFilterChange(f); if (activeCat !== 'All') onCatChange('All') }}
        >
          {f}
        </button>
      ))}
      {topCats.map(cat => (
        <button
          key={cat}
          className={`pill${activeCat === cat ? ' active' : ''}`}
          onClick={() => { onCatChange(cat); onFilterChange('All') }}
        >
          {cat}
        </button>
      ))}
      <button
        className={`pill favs-pill${showFavs ? ' active' : ''}`}
        onClick={onFavsToggle}
      >
        ♥ Saved
      </button>

      <div className="filter-row-right">
        <div className="view-toggle">
          <button
            className={`view-btn${activeView === 'grid' ? ' active' : ''}`}
            onClick={() => onViewChange('grid')}
          >
            ⊞ Grid
          </button>
          <button
            className={`view-btn${activeView === 'region' ? ' active' : ''}`}
            onClick={() => onViewChange('region')}
          >
            ☰ Region
          </button>
        </div>
        <select
          className="sort-select"
          value={sort}
          onChange={e => onSortChange(e.target.value)}
        >
          <option value="default">Sort: PRO first</option>
          <option value="az">Sort: A–Z</option>
          <option value="reviews">Sort: Most Reviewed</option>
          <option value="views">Sort: Most Viewed</option>
        </select>
      </div>
    </div>
  )
}
