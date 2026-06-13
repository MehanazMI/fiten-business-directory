'use client'

import { useEffect, useState, useMemo } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { stableColorIdx, categoryMap, i18n, oppLabels, oppTooltips } from '@/lib/utils'
import type { Lang } from '@/lib/utils'
import type { Business } from '@/types/business'
import SearchBar from './SearchBar'
import FilterRow from './FilterRow'
import BusinessGrid from './BusinessGrid'
import BusinessModal from './BusinessModal'
import ClaimModal from './ClaimModal'
import AddBusinessModal from './AddBusinessModal'

const PAGE_SIZE = 6

function parseDoc(doc: { id: string; data: () => Record<string, unknown> }): Business {
  const d = doc.data() as Record<string, unknown>
  const id = doc.id
  const rawName = (d.businessName as string) ?? ''
  const colorIdx = stableColorIdx(id)
  return {
    id,
    businessName: rawName,
    nameTamil: d.nameTamil as string | undefined,
    category: categoryMap[d.category as string] ?? (d.category as string) ?? 'Other',
    city: (d.city as string) ?? '',
    region: (d.region as string) ?? '',
    description: (d.description as string) ?? '',
    email: (d.email as string) ?? '',
    phone: d.phone as string | undefined,
    website: d.website as string | undefined,
    logoUrl: d.logoUrl as string | undefined,
    status: (d.status as string) ?? 'pending',
    pro: (d.pro as boolean) ?? false,
    speaker: (d.speaker as boolean) ?? false,
    women: (d.women as boolean) ?? false,
    convention: (d.convention as boolean) ?? false,
    looking: ((d.looking as string[]) ?? []) as Business['looking'],
    rating: (d.rating as number) ?? 0,
    reviews: (d.reviews as number) ?? 0,
    views: (d.views as number) ?? 0,
    createdAt: (d.createdAt as string) ?? '',
    initials: rawName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??',
    colorIdx,
  }
}

interface Props {
  initialData: Business[]
}

export default function DirectoryClient({ initialData }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>(initialData)
  const [fbError, setFbError] = useState<string | null>(null)

  const [lang, setLang] = useState<Lang>('en')
  const [activeCat, setActiveCat] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeView, setActiveView] = useState<'grid' | 'region'>('grid')
  const [showFavs, setShowFavs] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem('fiten_favorites')
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [claimTarget, setClaimTarget] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('default')
  const [activeOpps, setActiveOpps] = useState<Array<Business['looking'][number]>>([])
  const [showWomen, setShowWomen] = useState(false)

  useEffect(() => {
    localStorage.setItem('fiten_favorites', JSON.stringify([...favorites]))
  }, [favorites])

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'businesses'),
      snapshot => {
        const liveMap = new Map(
          snapshot.docs
            .map(doc => parseDoc(doc as Parameters<typeof parseDoc>[0]))
            .filter(b => b.status === 'active')
            .map(b => [b.id, b])
        )
        setBusinesses(prev => {
          const merged = prev.map(b => liveMap.get(b.id) ?? b)
          liveMap.forEach((b, id) => {
            if (!merged.find(m => m.id === id)) merged.push(b)
          })
          return merged.sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0) || b.reviews - a.reviews)
        })
      },
      err => {
        console.error('Firestore onSnapshot failed:', err)
        setFbError('Live updates unavailable. Showing latest cached data.')
      }
    )
    return () => unsub()
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = businesses.filter((b) => {
      if (showFavs && !favorites.has(b.id)) return false
      if (activeCat !== 'All' && b.category !== activeCat) return false
      if (activeFilter === 'Pro' && !b.pro) return false
      if (q && !b.businessName.toLowerCase().includes(q) &&
          !b.description.toLowerCase().includes(q) &&
          !b.category.toLowerCase().includes(q)) return false
        if (activeOpps.length > 0 && !activeOpps.every(op => b.looking.includes(op))) return false
      if (showWomen && !b.women) return false
      return true
    })

    if (sort === 'az') list = [...list].sort((a, b) => a.businessName.localeCompare(b.businessName))
    else if (sort === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews)
    else if (sort === 'views') list = [...list].sort((a, b) => b.views - a.views)
    else list = [...list].sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0))

    return list
  }, [businesses, searchQuery, activeCat, activeFilter, activeOpps, showFavs, favorites, sort, showWomen])

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { All: businesses.length }
    businesses.forEach(b => { map[b.category] = (map[b.category] ?? 0) + 1 })
    return map
  }, [businesses])

  const cats = ['All', ...new Set(Object.values(categoryMap))]
  const cityCount = new Set(businesses.map(b => b.city).filter(Boolean)).size
  const t = i18n[lang]

  const resetPaging = () => setVisibleCount(PAGE_SIZE)

  return (
    <>
      {fbError && <div className="fb-error-banner">{fbError}</div>}

      <header className="site-header">
        <div className="logo-area" onClick={() => {
          setActiveCat('All'); setActiveFilter('All'); setSearchQuery('');
          setSort('default'); setActiveOpps([]); setShowFavs(false);
          setShowWomen(false); resetPaging();
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}>
          <span className="logo-text">FiTEN</span>
          <span className="logo-dot">·</span>
          <span className="logo-tag">Business Directory</span>
        </div>
        <nav className="nav-hdr">
          <span className="nav-link active">Directory</span>
        </nav>
        <div className="hdr-right">
          <div className="lang-toggle">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn${lang === 'ta' ? ' active' : ''}`} onClick={() => setLang('ta')}>தமிழ்</button>
          </div>
          <button className="hdr-btn" onClick={() => setShowAddModal(true)}>+ List Business</button>
        </div>
      </header>

      <div className="brand-strip">
        <div className="brand-strip-left">
          <div className="brand-eyebrow">Tamil Business Network</div>
          <div className="brand-title" dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
          <div className="brand-sub">{t.heroSub}</div>
        </div>
        <div className="brand-stats">
          <div className="brand-stat"><strong>{businesses.length}+</strong><span>Businesses</span></div>
          <div className="brand-stat"><strong>{cityCount}</strong><span>Cities</span></div>
          <div className="brand-stat"><strong>8</strong><span>Sectors</span></div>
        </div>
      </div>

      <div className="search-strip">
        <div className="search-wrap">
          <SearchBar
            value={searchQuery}
            placeholder={t.searchPlaceholder}
            searchLabel={t.searchBtn}
            onChange={v => { setSearchQuery(v); resetPaging() }}
          />
        </div>
      </div>

      <FilterRow
        activeFilter={activeFilter}
        activeCat={activeCat}
        activeView={activeView}
        sort={sort}
        showFavs={showFavs}
        catCounts={catCounts}
        onFilterChange={f => { setActiveFilter(f); resetPaging() }}
        onCatChange={c => { setActiveCat(c); resetPaging() }}
        onViewChange={v => { setActiveView(v); resetPaging() }}
        onSortChange={s => { setSort(s); resetPaging() }}
        onFavsToggle={() => { setShowFavs(v => !v); resetPaging() }}
      />

      <div className="main-layout">
        <aside className="sidebar">
          <p className="sidebar-title">Categories</p>
          <ul className="cat-list">
            {cats.map(cat => (
              <li
                key={cat}
                className={`cat-item${activeCat === cat ? ' active' : ''}`}
                onClick={() => { setActiveCat(cat); resetPaging() }}
              >
                {cat}
                <span className="cat-badge">{catCounts[cat] ?? 0}</span>
              </li>
            ))}
          </ul>

          <hr className="sidebar-divider" />
          <p className="sidebar-title" title="Filter by what businesses are actively looking for">B2B Signals</p>
          {(['partner', 'hire', 'invest', 'client'] as const).map(op => (
            <label key={op} className="filter-check" title={oppTooltips[op]}>
              <input
                type="checkbox"
                checked={activeOpps.includes(op)}
                onChange={e => {
                  setActiveOpps(prev =>
                    e.target.checked ? [...prev, op] : prev.filter(x => x !== op)
                  )
                  resetPaging()
                }}
              />
              {oppLabels[op]}
            </label>
          ))}

          <hr className="sidebar-divider" />
          <p className="sidebar-title">Community</p>
          <label className="filter-check">
            <input type="checkbox" checked={activeFilter === 'Pro'} onChange={e => { setActiveFilter(e.target.checked ? 'Pro' : 'All'); resetPaging() }} />
            PRO Members
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={showWomen} onChange={e => { setShowWomen(e.target.checked); resetPaging() }} />
            Women-Led
          </label>
        </aside>

        <main className="content">
          <div className="content-header">
            <span className="result-count">{filtered.length} businesses</span>
          </div>
          <BusinessGrid
            businesses={filtered}
            view={activeView}
            visibleCount={visibleCount}
            favorites={favorites}
            lang={lang}
            onSelect={setCurrentBusiness}
            onFavorite={toggleFavorite}
            onLoadMore={() => setVisibleCount(v => v + PAGE_SIZE)}
          />
        </main>
      </div>

      <BusinessModal
        business={currentBusiness}
        lang={lang}
        onClose={() => setCurrentBusiness(null)}
        onClaim={name => { setClaimTarget(name); setCurrentBusiness(null) }}
      />

      <ClaimModal
        businessName={claimTarget}
        onClose={() => setClaimTarget(null)}
      />

      {showAddModal && <AddBusinessModal onClose={() => setShowAddModal(false)} />}
    </>
  )
}
