'use client'

import { useEffect, useState, useMemo } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { stableColorIdx, categoryMap, i18n, oppLabels, oppTooltips } from '@/lib/utils'
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
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'region'>('grid')
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
  const [showSpeaker, setShowSpeaker] = useState(false)

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
      if (showSpeaker && !b.speaker) return false
      return true
    })

    if (sort === 'az') list = [...list].sort((a, b) => a.businessName.localeCompare(b.businessName))
    else if (sort === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews)
    else if (sort === 'views') list = [...list].sort((a, b) => b.views - a.views)
    else list = [...list].sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0))

    return list
  }, [businesses, searchQuery, activeCat, activeFilter, activeOpps, showFavs, favorites, sort, showWomen, showSpeaker])

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { All: businesses.length }
    businesses.forEach(b => { map[b.category] = (map[b.category] ?? 0) + 1 })
    return map
  }, [businesses])

  const cats = ['All', ...new Set(Object.values(categoryMap))]
  const cityCount = new Set(businesses.map(b => b.city).filter(Boolean)).size
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
  if (activeFilter === 'Pro') activeChips.push({ label: 'PRO only', onRemove: () => { setActiveFilter('All'); resetPaging() } })
  if (showFavs) activeChips.push({ label: 'Saved', onRemove: () => { setShowFavs(false); resetPaging() } })
  if (showWomen) activeChips.push({ label: 'Women-Led', onRemove: () => { setShowWomen(false); resetPaging() } })
  if (showSpeaker) activeChips.push({ label: 'Speakers', onRemove: () => { setShowSpeaker(false); resetPaging() } })
  activeOpps.forEach(op => activeChips.push({ label: oppLabels[op], onRemove: () => { setActiveOpps(prev => prev.filter(x => x !== op)); resetPaging() } }))

  return (
    <>
      {fbError && <div className="fb-error-banner">{fbError}</div>}

      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="logo-area" onClick={resetAll}>
          <span className="logo-text">
            <span className="logo-fi">Fi</span>
            <span className="logo-ten">TEN</span>
          </span>
          <span className="logo-divider" aria-hidden="true" />
          <span className="logo-tag">Business Directory</span>
        </div>

        <nav className="nav-hdr">
          <span className="nav-link active">Browse</span>
          <a className="nav-link" href="/form">Add Business</a>
          <span className="nav-link">Contact</span>
        </nav>

        <div className="hdr-right">
          <div className="lang-toggle">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <span className="lang-sep">|</span>
            <button className={`lang-btn${lang === 'ta' ? ' active' : ''}`} onClick={() => setLang('ta')}>தமிழ்</button>
          </div>
          <button className="hdr-btn" onClick={() => setShowAddModal(true)}>
            <i className="ti ti-plus" />
            Add Your Business
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-section">
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
      </section>

      {/* ── DARK STATS BAR ── */}
      <div className="stats-dark-bar">
        <div className="stats-dark-item">
          <i className="ti ti-building" />
          <strong>{businesses.length}+</strong> Businesses
        </div>
        <div className="stats-dark-item">
          <i className="ti ti-map-pin" />
          <strong>{cityCount}</strong> Cities
        </div>
        <div className="stats-dark-item">
          <i className="ti ti-category" />
          <strong>{cats.length - 1}</strong> Sectors
        </div>
        <div className="stats-dark-item">
          <i className="ti ti-globe" />
          <strong>3</strong> Continents
        </div>
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
                  className={`cat-item${activeCat === cat ? ' active' : ''}`}
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

          {/* Community */}
          <div className="sb-section">
            <div className="sb-label">Community</div>
            <div className="chip-row">
              <button
                className={`chip${activeFilter === 'Pro' ? ' on' : ''}`}
                onClick={() => { setActiveFilter(activeFilter === 'Pro' ? 'All' : 'Pro'); resetPaging() }}
              >
                <i className="ti ti-crown" />
                PRO
              </button>
              <button
                className={`chip chip-sage${showFavs ? ' on' : ''}`}
                onClick={() => { setShowFavs(v => !v); resetPaging() }}
              >
                <i className="ti ti-heart" />
                Saved
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
                <option value="default">PRO first</option>
                <option value="az">A–Z</option>
                <option value="reviews">Most Reviewed</option>
                <option value="views">Most Viewed</option>
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
                  className={`view-btn${activeView === 'region' ? ' active' : ''}`}
                  title="Region view"
                  onClick={() => { setActiveView('region'); resetPaging() }}
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
        <button className="cta-listing-btn" onClick={() => setShowAddModal(true)}>
          <i className="ti ti-plus" />
          Add Your Business
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="dir-footer">
        <div className="dir-footer-grid">
          <div>
            <div className="dir-footer-brand">
              Fi<span>TEN</span>
            </div>
            <p className="dir-footer-tagline">
              The official Tamil business directory of FeTNA — connecting professionals, partners, and investors across the global Tamil community.
            </p>
            <div className="dir-footer-org-links">
              <a href="https://fiten.org" target="_blank" rel="noopener noreferrer" className="dir-footer-org-link">fiten.org ↗</a>
              <a href="https://fetna.org" target="_blank" rel="noopener noreferrer" className="dir-footer-org-link">fetna.org ↗</a>
            </div>
          </div>
          <div>
            <div className="dir-footer-col-title">Directory</div>
            <ul className="dir-footer-links">
              <li><span onClick={resetAll}>Browse Businesses</span></li>
              <li><a href="/form">Add Your Business</a></li>
            </ul>
          </div>
          <div>
            <div className="dir-footer-col-title">Organization</div>
            <ul className="dir-footer-links">
              <li><a href="https://fetna.org" target="_blank" rel="noopener noreferrer">FeTNA</a></li>
              <li><a href="https://fiten.org" target="_blank" rel="noopener noreferrer">FiTEN Global</a></li>
              <li><span>Contact</span></li>
            </ul>
          </div>
        </div>
        <hr className="dir-footer-divider" />
        <p className="dir-footer-copy">© 2026 FiTEN · Official directory of FeTNA · <a href="https://fetna.org" target="_blank" rel="noopener noreferrer" style={{color:'inherit'}}>fetna.org</a> · Privacy · Terms</p>
      </footer>
    </>
  )
}
