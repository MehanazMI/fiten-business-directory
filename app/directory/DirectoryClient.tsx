'use client'

import { useEffect, useState, useMemo } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { stableColorIdx, categoryMap, i18n, oppLabels, oppTooltips } from '@/lib/utils'
import { deriveGeoStats } from '@/lib/geo'
import type { Lang } from '@/lib/utils'
import type { Business } from '@/types/business'
import BusinessGrid from './BusinessGrid'
import BusinessModal from './BusinessModal'
import ClaimModal from './ClaimModal'
import AddBusinessModal from './AddBusinessModal'

const PAGE_SIZE = 9

const CAT_ICONS: Record<string, string> = {
  'All':          'ti-layout-grid',
  'Healthcare':   'ti-stethoscope',
  'Tech':         'ti-device-laptop',
  'Education':    'ti-school',
  'Legal':        'ti-scale',
  'Food':         'ti-tools-kitchen-2',
  'Finance':      'ti-coin',
  'Real Estate':  'ti-home',
  'Retail':       'ti-shopping-cart',
  'Entertainment':'ti-music',
  'Services':     'ti-tool',
}

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
    verified: (d.verified as boolean) ?? false,
    verificationStatus: (d.verificationStatus as Business['verificationStatus']) ?? 'unverified',
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
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFavs, setShowFavs] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [claimTarget, setClaimTarget] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('default')
  const [activeOpps, setActiveOpps] = useState<Array<Business['looking'][number]>>([])
  const [showWomen, setShowWomen] = useState(false)
  const [showSpeaker, setShowSpeaker] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fiten_favorites')
      if (stored) setFavorites(new Set(JSON.parse(stored) as string[]))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) setSearchQuery(q)
  }, [])

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
        setBusinesses(() => {
          const merged = Array.from(liveMap.values())
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
      if (showSpeaker && !b.speaker) return false
      return true
    })

    if (sort === 'az') list = [...list].sort((a, b) => a.businessName.localeCompare(b.businessName))
    else if (sort === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews)
    else if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    else list = [...list].sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0))

    return list
  }, [businesses, searchQuery, activeCat, activeFilter, activeOpps, showFavs, favorites, sort, showWomen, showSpeaker])

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { All: businesses.length }
    businesses.forEach(b => { map[b.category] = (map[b.category] ?? 0) + 1 })
    return map
  }, [businesses])

  const cats = ['All', ...new Set(Object.values(categoryMap))]
  const cityList = businesses.map(b => b.city).filter(Boolean)
  const cityCount = new Set(cityList).size
  const continentCount = deriveGeoStats(cityList).continents
  const bizCount = businesses.length >= 50
    ? `${Math.floor(businesses.length / 10) * 10}+`
    : `${businesses.length}`
  const t = i18n[lang]

  const resetPaging = () => setVisibleCount(PAGE_SIZE)
  const resetAll = () => {
    setActiveCat('All'); setActiveFilter('All'); setSearchQuery('');
    setSort('default'); setActiveOpps([]); setShowFavs(false);
    setShowWomen(false); setShowSpeaker(false); resetPaging();
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = []
  if (activeCat !== 'All') activeChips.push({ label: activeCat, onRemove: () => { setActiveCat('All'); resetPaging() } })
  if (activeFilter === 'Pro') activeChips.push({ label: 'FeTNA Sponsors', onRemove: () => { setActiveFilter('All'); resetPaging() } })
  if (showFavs) activeChips.push({ label: 'Saved', onRemove: () => { setShowFavs(false); resetPaging() } })
  if (showWomen) activeChips.push({ label: 'Women-Led', onRemove: () => { setShowWomen(false); resetPaging() } })
  if (showSpeaker) activeChips.push({ label: 'Speakers', onRemove: () => { setShowSpeaker(false); resetPaging() } })
  activeOpps.forEach(op => activeChips.push({ label: oppLabels[op], onRemove: () => { setActiveOpps(prev => prev.filter(x => x !== op)); resetPaging() } }))

  return (
    <>
      {fbError && <div className="fb-error-banner">{fbError}</div>}

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">
            Global Tamil Business Network
          </div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
          <p className="hero-sub">{t.heroSub}</p>
          <div className="hero-search">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); resetPaging() }}
            />
            <button>
              <i className="ti ti-search" />
              {t.searchBtn}
            </button>
          </div>
          <div className="hero-inline-stats">
            <div className="his-item">
              <i className="ti ti-building-store" style={{ color: '#C5A059', fontSize: '1.1rem' }} />
              <strong>{bizCount}</strong><span>Businesses</span>
            </div>
            <div className="his-sep" />
            <div className="his-item">
              <i className="ti ti-map-pin" style={{ color: '#7C3AED', fontSize: '1.1rem' }} />
              <strong>{cityCount}</strong><span>Cities</span>
            </div>
            <div className="his-sep" />
            <div className="his-item">
              <i className="ti ti-layout-grid" style={{ color: '#059669', fontSize: '1.1rem' }} />
              <strong>{cats.length - 1}</strong><span>Sectors</span>
            </div>
            <div className="his-sep" />
            <div className="his-item">
              <i className="ti ti-world" style={{ color: '#2563EB', fontSize: '1.1rem' }} />
              <strong>{continentCount}</strong><span>Continents</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK FILTER PILLS ── */}
      <div className="quick-filters" id="categories">
        {(['All', 'Pro', ...cats.filter(c => c !== 'All').slice(0, 5)]).map(f => {
          const isActive = (f === 'All' && activeCat === 'All' && activeFilter === 'All') || (f === 'Pro' && activeFilter === 'Pro') || (f !== 'All' && f !== 'Pro' && activeCat === f)
          const isPro = f === 'Pro'
          return (
            <button
              key={f}
              className={`qf-pill${isPro ? ' qf-pill-pro' : ''}${isActive ? ' active' : ''}`}
              onClick={() => {
                resetPaging()
                if (f === 'All') { setActiveCat('All'); setActiveFilter('All') }
                else if (f === 'Pro') { setActiveCat('All'); setActiveFilter('Pro') }
                else { setActiveCat(f); setActiveFilter('All') }
              }}
            >
              {isPro ? <><i className="ti ti-rosette" /> FeTNA Sponsor</> : f}
            </button>
          )
        })}
        <button
          aria-label="Show saved businesses"
          className={`qf-pill qf-saved${showFavs ? ' active' : ''}`}
          onClick={() => { setShowFavs(v => !v); resetPaging() }}
        >
          <i className={`ti ${showFavs ? 'ti-heart-filled' : 'ti-heart'}`} /> Saved
        </button>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="main-layout">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          {/* Categories */}
          <div className="sb-section">
            <div className="sb-label">Categories</div>
            <ul className="cat-list">
              {cats.map(cat => (
                <li
                  key={cat}
                  className={`cat-item${activeCat === cat ? ' active' : ''}${(catCounts[cat] ?? 0) === 0 ? ' cat-item--zero' : ''}`}
                  onClick={() => { setActiveCat(cat); resetPaging() }}
                >
                  <span className="cat-item-left">
                    <i className={`ti ${CAT_ICONS[cat] ?? 'ti-folder'} cat-icon`} />
                    {cat}
                  </span>
                  <span className="cat-badge">{catCounts[cat] ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="sidebar-divider" />

          {/* Community */}
          <div className="sb-section">
            <div className="sb-label">Community</div>
            <div className="chip-row">
              <button
                className={`chip${activeFilter === 'Pro' ? ' on' : ''}`}
                onClick={() => { setActiveFilter(activeFilter === 'Pro' ? 'All' : 'Pro'); resetPaging() }}
              >
                <i className="ti ti-rosette" /> FeTNA Sponsor
              </button>
              <button
                className={`chip chip-sage${showFavs ? ' on' : ''}`}
                onClick={() => { setShowFavs(v => !v); resetPaging() }}
              >
                <i className={`ti ${showFavs ? 'ti-heart-filled' : 'ti-heart'}`} /> Saved
              </button>
              <button
                className={`chip chip-sage${showWomen ? ' on' : ''}`}
                onClick={() => { setShowWomen(v => !v); resetPaging() }}
              >
                Women-Led
              </button>
              <button
                className={`chip${showSpeaker ? ' on' : ''}`}
                onClick={() => { setShowSpeaker(v => !v); resetPaging() }}
              >
                Speakers
              </button>
            </div>
          </div>

          <hr className="sidebar-divider" />

          {/* B2B Signals */}
          <div className="sb-section">
            <div className="sb-label" title="Filter by what businesses are actively looking for">B2B Signals</div>
            <div className="chip-row">
              {(['partner', 'hire', 'invest', 'client'] as const).map(op => (
                <button
                  key={op}
                  className={`chip${activeOpps.includes(op) ? ' on' : ''}`}
                  title={oppTooltips[op]}
                  onClick={() => {
                    setActiveOpps(prev =>
                      prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op]
                    )
                    resetPaging()
                  }}
                >
                  {oppLabels[op]}
                </button>
              ))}
            </div>
          </div>

          <hr className="sidebar-divider" />

          {/* Language */}
          <div className="sb-section">
            <div className="sb-label">Language</div>
            <div className="lang-toggle">
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <span className="lang-sep">|</span>
              <button className={`lang-btn${lang === 'ta' ? ' active' : ''}`} onClick={() => setLang('ta')}>தமிழ்</button>
            </div>
          </div>

        </aside>

        {/* ── CONTENT ── */}
        <main className="content">

          {/* Toolbar */}
          <div className="content-toolbar">
            <span className="result-count">{filtered.length} businesses</span>
            <div className="toolbar-right">
              <select
                className="sort-select"
                value={sort}
                onChange={e => { setSort(e.target.value); resetPaging() }}
              >
                <option value="default">Sponsors first</option>
                <option value="az">A–Z</option>
                <option value="reviews">Most Reviewed</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="view-toggle">
                <button
                  className={`view-btn${activeView === 'grid' ? ' active' : ''}`}
                  title="Grid view"
                  onClick={() => { setActiveView('grid'); resetPaging() }}
                >
                  <i className="ti ti-layout-grid" />
                </button>
                <button
                  className={`view-btn${activeView === 'list' ? ' active' : ''}`}
                  title="List view"
                  onClick={() => { setActiveView('list'); resetPaging() }}
                >
                  <i className="ti ti-layout-list" />
                </button>
                <button
                  className={`view-btn${activeView === 'map' ? ' active' : ''}`}
                  title="Map view"
                  onClick={() => { setActiveView('map'); resetPaging() }}
                >
                  <i className="ti ti-map-pin" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="active-filters-row">
              <span className="af-row-label">Filters:</span>
              {activeChips.map(chip => (
                <button key={chip.label} className="af-chip" onClick={chip.onRemove}>
                  {chip.label}
                  <i className="ti ti-x" />
                </button>
              ))}
              <button className="af-clear-all" onClick={resetAll}>Clear all</button>
            </div>
          )}

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

      {/* ── CTA ── */}
      <section className="cta-listing">
        <h2>Ready to list your business on FiTEN?</h2>
        <p>Join Tamil businesses trusted by partners, clients, and investors worldwide. It only takes a few minutes to get listed.</p>
        <a className="cta-listing-btn" href="/form">
          Add Your Business
        </a>
      </section>
    </>
  )
}
