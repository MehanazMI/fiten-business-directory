interface Props {
  activeFilter: string
  activeView: 'grid' | 'region'
  sort: string
  showFavs: boolean
  onFilterChange: (f: string) => void
  onViewChange: (v: 'grid' | 'region') => void
  onSortChange: (s: string) => void
  onFavsToggle: () => void
}

const FILTERS = ['All', 'Pro']

export default function FilterRow({
  activeFilter, activeView, sort, showFavs,
  onFilterChange, onViewChange, onSortChange, onFavsToggle,
}: Props) {
  return (
    <div className="filter-row">
      {FILTERS.map(f => (
        <button
          key={f}
          className={`pill${activeFilter === f ? ' active' : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
      <button
        className={`pill${showFavs ? ' active' : ''}`}
        onClick={onFavsToggle}
      >
        ❤️ Saved
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
          <option value="reviews">Sort: Most Connected</option>
          <option value="views">Sort: Most Viewed</option>
        </select>
      </div>
    </div>
  )
}
