# FiTEN Business Directory — Next.js Architecture Review
**Pre-build reference | June 2026 | Lock before writing code**

---

## File Structure

```
fiten-directory/
├── app/
│   ├── layout.tsx                  ← root layout, globals.css import, font
│   ├── page.tsx                    ← redirects to /directory (or hero landing)
│   ├── directory/
│   │   ├── page.tsx                ← Server Component: fetches initial data via REST
│   │   ├── DirectoryClient.tsx     ← 'use client': all state + onSnapshot
│   │   ├── SearchBar.tsx           ← presentational, props only
│   │   ├── FilterRow.tsx           ← presentational, props only
│   │   ├── BusinessGrid.tsx        ← presentational, props only
│   │   ├── BusinessCard.tsx        ← presentational, props only
│   │   ├── BusinessModal.tsx       ← presentational, props only
│   │   ├── ClaimModal.tsx          ← presentational, props only
│   │   └── AddBusinessModal.tsx    ← 'use client' (has its own form state)
│   ├── directory/[id]/
│   │   └── page.tsx                ← generateStaticParams + generateMetadata + revalidate
│   └── form/
│       └── page.tsx                ← redirect to AddBusinessModal or standalone form
├── components/
│   └── Toast.tsx                   ← global toast (used in layout)
├── lib/
│   ├── firebase-client.ts          ← Firebase JS SDK init (client-only)
│   ├── firestore-rest.ts           ← Firestore REST API helpers (server-safe)
│   └── utils.ts                    ← stableColorIdx, categoryMap, i18n, oppLabels
├── types/
│   └── business.ts                 ← Business interface (single source of truth)
├── app/globals.css                 ← verbatim CSS from index.html <style> block
└── next.config.ts
```

---

## Decision 1 — App Router ✅

**Verdict: Correct. No changes.**

Server Components handle the SEO-critical renders (directory listing initial data, individual business pages). Client Components handle interactivity. The boundary is clean:

| Route | Component type | Reason |
|---|---|---|
| `app/directory/page.tsx` | Server | Fetches initial data, renders shell |
| `DirectoryClient.tsx` | Client | `onSnapshot`, filter state, modals |
| `app/directory/[id]/page.tsx` | Server | Static generation + metadata |
| `AddBusinessModal.tsx` | Client | Has form state |

---

## Decision 2 — Firebase Dual Approach ✅ (with clarification)

**Verdict: Correct approach, one clarification needed.**

**Client-side (real-time):** Firebase JS SDK `onSnapshot` inside `DirectoryClient.tsx`. Import from `lib/firebase-client.ts`.

```ts
// lib/firebase-client.ts
'use client'  // ← or just don't import this from any Server Component
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = { /* ... */ }
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

> **Why `getApps().length` check?** Next.js hot reload re-runs module init. Without this guard you get "Firebase: already initialized" errors in development.
> **Limitation:** This guard assumes a single Firebase project. If a second project is ever added, use `getApp(name)` with named instances instead.

**Server-side (initial fetch + static pages):** Firestore REST API directly. No SDK, no Node.js Firebase Admin package to configure.

```ts
// lib/firestore-rest.ts
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

// Firestore REST wraps every value in a typed object: { stringValue: "x" }, { booleanValue: true }, etc.
// This helper unwraps a single document from that format into a plain Business object.
function parseFirestoreDoc(doc: FirestoreRestDoc): Business {
  const f = doc.fields
  const id = doc.name.split('/').pop()!
  return {
    id,
    businessName: f.businessName?.stringValue ?? '',
    nameTamil:    f.nameTamil?.stringValue,
    category:     f.category?.stringValue ?? '',
    city:         f.city?.stringValue ?? '',
    region:       f.region?.stringValue ?? '',
    description:  f.description?.stringValue ?? '',
    email:        f.email?.stringValue ?? '',
    phone:        f.phone?.stringValue,
    website:      f.website?.stringValue,
    status:       f.status?.stringValue ?? 'pending',
    pro:          f.pro?.booleanValue ?? false,
    speaker:      f.speaker?.booleanValue ?? false,
    women:        f.women?.booleanValue ?? false,
    convention:   f.convention?.booleanValue ?? false,
    looking:      f.looking?.arrayValue?.values?.map(v => v.stringValue as Business['looking'][number]) ?? [],
    rating:       f.rating?.doubleValue ?? f.rating?.integerValue ?? 0,
    reviews:      f.reviews?.integerValue ?? 0,
    views:        f.views?.integerValue ?? 0,
    createdAt:    f.createdAt?.timestampValue ?? '',
    // derived
    initials:     (f.businessName?.stringValue ?? '??').slice(0, 2).toUpperCase(),
    colorIdx:     stableColorIdx(id),
  }
}

// Internal type — not exported. Only used to type the REST response shape.
interface FirestoreRestDoc {
  name: string
  fields: Record<string, {
    stringValue?: string
    booleanValue?: boolean
    integerValue?: number
    doubleValue?: number
    timestampValue?: string
    arrayValue?: { values?: Array<{ stringValue?: string }> }
  }>
}

export async function fetchBusinesses(): Promise<Business[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/businesses`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Firestore fetch failed')
  const data = await res.json()
  return data.documents?.map(parseFirestoreDoc).filter((b: Business) => b.status === 'active') ?? []
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/businesses/${id}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return parseFirestoreDoc(await res.json())
}
```

> **Why not Firebase Admin SDK?** Requires a service account JSON and server environment setup. The REST API works with zero credentials for public Firestore rules, which this project uses. Keep it simple.

---

## Decision 3 — CSS Verbatim to globals.css ✅

**Verdict: Correct. No changes.**

The `<style>` block in `index.html` is ~1,500 lines. Cut-paste it wholesale into `app/globals.css`. Remove the `*` reset that Next.js already handles. Do not touch selectors, variables, or values — zero redesign.

One thing to verify: the CSS uses `:root` custom properties (`--red`, `--gold`, etc.). These work identically in Next.js globals.css.

**What does NOT move to globals.css:**
- Inline `style=` attributes on HTML elements → become `style={{ }}` in JSX
- Dynamic class toggling via `classList` → becomes conditional `className` in React

---

## Decision 4 — Filter State in React useState ✅ (with forward note)

**Verdict: Correct for Phase 2. One naming note.**

From the existing code, the full state inventory is:

```ts
// All state that currently lives in global JS variables → moves to DirectoryClient.tsx
const [lang, setLang] = useState<'en' | 'ta'>('en')
const [activeCat, setActiveCat] = useState('All')
const [activeFilter, setActiveFilter] = useState('All')     // B2B signals (Pro, Speaker, etc.)
const [activeView, setActiveView] = useState<'grid' | 'region'>('grid')
const [showFavs, setShowFavs] = useState(false)
const [favorites, setFavorites] = useState<Set<string>>(new Set())
const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)  // detail modal
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
const [searchQuery, setSearchQuery] = useState('')
const [locationFilter, setLocationFilter] = useState('')
const [activeOpps, setActiveOpps] = useState<Array<'partner' | 'client' | 'invest' | 'hire'>>([])  // matches Business.looking
const [businesses, setBusinesses] = useState<Business[]>(initialData)
```

> **`favorites` is a Set — React state gotcha:** `useState<Set<string>>` works but requires spreading on update:
> ```ts
> setFavorites(prev => new Set([...prev, name]))         // add
> setFavorites(prev => { const s = new Set(prev); s.delete(name); return s }) // remove
> ```
> Never mutate the existing Set and call setState — React won't detect the change.

**`favorites` must persist to `localStorage` — do this in Phase 2, not Phase 3.** Users expect saved favorites to survive a page refresh. Without it they will report it as a bug.

```ts
// Initialize from localStorage on mount (client only)
const [favorites, setFavorites] = useState<Set<string>>(() => {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem('fiten_favorites')
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
  } catch {
    return new Set()
  }
})

// Sync to localStorage on every change
useEffect(() => {
  localStorage.setItem('fiten_favorites', JSON.stringify([...favorites]))
}, [favorites])
```

> The `typeof window === 'undefined'` guard prevents a crash during server-side render. The `useState` initializer only runs on the client, but TypeScript/Next.js doesn't know that — the guard makes it explicit.

**Phase 3 note:** When URL params are added, these move to `useSearchParams` + `useRouter`. The component structure won't change — only where state is read/written.

---

## Decision 5 — TypeScript Strict Mode ✅

**Verdict: Correct. No changes.**

The Firestore data model is already fully documented. Define it once:

```ts
// types/business.ts
export interface Business {
  id: string           // Firestore document ID
  businessName: string
  nameTamil?: string
  category: string
  city: string
  region: 'North America' | 'South Asia' | 'Global' | string
  description: string
  email: string
  phone?: string
  website?: string
  status: string
  pro: boolean
  looking: Array<'partner' | 'client' | 'invest' | 'hire'>
  speaker: boolean
  women: boolean
  convention: boolean
  rating: number
  reviews: number
  views: number
  createdAt: string
  // Derived fields (set at read time, not in Firestore)
  initials: string
  colorIdx: number
}
```

`tsconfig.json` must have `"strict": true`. It's on by default in `create-next-app` — don't turn it off.

---

## Decision 6 — Component Split (REVISED from original) ✅

**Original decision:** Single `DirectoryClient.tsx`.  
**Revised:** `DirectoryClient.tsx` as state owner + thin presentational children.

**Why the revision:** The existing `index.html` has 30+ functions and 13 distinct state variables. A single file would be 800–1,000+ lines — the same maintenance problem as today.

**The pattern — no prop drilling, no Context needed:**

```
DirectoryClient.tsx        ← owns ALL state + onSnapshot subscription
│                            passes filtered/sorted data down as props
├── SearchBar.tsx            props: value, onChange, suggestions, onSelect
├── FilterRow.tsx            props: activeCat, activeFilter, activeView, sort,
│                                    onCatChange, onFilterChange, onViewChange,
│                                    onSortChange, onClear, showClearBtn
├── BusinessGrid.tsx         props: businesses[], visibleCount, view,
│                                    onSelect, onFavorite, favorites, onLoadMore
│   └── BusinessCard.tsx     props: business, isFavorited, onSelect, onFavorite
├── BusinessModal.tsx        props: business | null, onClose, onClaim
├── ClaimModal.tsx           props: businessName | null, onClose, onSubmit
└── AddBusinessModal.tsx     'use client' — own form state, calls REST API on submit
```

Each file stays under ~150 lines. Volunteer developers can touch `SearchBar.tsx` without reading filter logic.

> **The `filterBiz()` equivalent** becomes a `useMemo` in `DirectoryClient.tsx`:
> ```ts
> const filtered = useMemo(() => {
>   let list = businesses.filter(b => { /* all filter conditions */ })
>   // sort
>   return list
> }, [businesses, searchQuery, activeCat, activeFilter, activeOpps, locationFilter, showFavs, favorites, sort])
> ```
> This replaces the current `filterBiz()` + `_fbDebounce` pattern. React's `useMemo` handles the debounce concern automatically — it only recomputes when dependencies change.

---

## Decision 7 — `generateStaticParams` + `generateMetadata` ✅ (+ Addition 1)

**Verdict: Correct. Revalidation is required.**

```ts
// app/directory/[id]/page.tsx

export const revalidate = 3600  // ← ADDITION 1: regenerate each business page hourly

export async function generateStaticParams() {
  const businesses = await fetchBusinesses()
  return businesses.map(b => ({ id: b.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const business = await fetchBusinessById(params.id)
  if (!business) return { title: 'Business Not Found | FiTEN' }
  return {
    title: `${business.businessName} | FiTEN Business Directory`,
    description: business.description?.slice(0, 155),
    openGraph: {
      title: business.businessName,
      description: business.description?.slice(0, 155),
      url: `https://fiten.org/directory/${business.id}`,
    }
  }
}
```

**Without `revalidate = 3600`:** New businesses added via the form won't get a `/directory/[id]` page until the next manual deploy. With it, Next.js regenerates stale pages in the background, hourly. No code changes needed when new businesses are added.

**Note on `app/directory/page.tsx` (the listing page):** This page does NOT need `revalidate` because `DirectoryClient` uses `onSnapshot` for live updates after hydration. However, `generateStaticParams` (which runs at build time) uses `fetchBusinesses` — a new business added after deploy won't appear in the static params until the next build. This is acceptable for the `[id]` detail page. The listing itself always shows live data via `onSnapshot`.

---

## Addition 2 — Server-First Hydration Pattern (REQUIRED)

**This is the most architecturally important addition.**

Without this, the directory page renders an empty shell with a spinner — crawlers see no business cards.

```ts
// app/directory/page.tsx  ← Server Component
import { fetchBusinesses } from '@/lib/firestore-rest'
import DirectoryClient from './DirectoryClient'

export default async function DirectoryPage() {
  const initialData = await fetchBusinesses()   // ← server fetch at request time
  return <DirectoryClient initialData={initialData} />
}
```

```ts
// DirectoryClient.tsx  ← Client Component
'use client'
import { useEffect, useState } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'

export default function DirectoryClient({ initialData }: { initialData: Business[] }) {
  const [businesses, setBusinesses] = useState(initialData)  // ← renders immediately
  const [fbError, setFbError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'businesses'),
      snapshot => {
        const liveMap = new Map(
          snapshot.docs
            .map(doc => parseDoc(doc))
            .filter(b => b.status === 'active')
            .map(b => [b.id, b])
        )
        // Merge: prefer live data; keep initialData entries not yet in snapshot
        setBusinesses(prev => {
          const merged = prev.map(b => liveMap.get(b.id) ?? b)
          liveMap.forEach((b, id) => {
            if (!merged.find(m => m.id === id)) merged.push(b)
          })
          return merged.sort((a, b) => (b.pro ? 1 : 0) - (a.pro ? 1 : 0) || b.reviews - a.reviews)
        })
      },
      err => {
        // onSnapshot errors are permanent (quota exceeded, rules revoked, etc.)
        // Fall back gracefully to the server-rendered initialData already in state.
        console.error('Firestore onSnapshot failed:', err)
        setFbError('Live updates unavailable. Showing latest cached data.')
      }
    )
    return () => unsub()
  }, [])

  if (fbError) {
    // Non-fatal banner — directory still works with initialData
    // Render the banner inside the layout, above the grid
  }

  // ... rest of component
}
```

**Result:** Fast first paint with real business cards → Google indexes actual content → live updates arrive silently after hydration. If Firestore subscription fails, users see a non-fatal banner and keep the server-rendered data.

**Wrap `DirectoryClient` in an error boundary in `app/directory/page.tsx`** to catch synchronous render errors (malformed data, unexpected nulls):

```tsx
// app/directory/page.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { fetchBusinesses } from '@/lib/firestore-rest'
import DirectoryClient from './DirectoryClient'

export default async function DirectoryPage() {
  const initialData = await fetchBusinesses()
  return (
    <ErrorBoundary fallback={<p>Directory temporarily unavailable.</p>}>
      <Suspense fallback={null}>
        <DirectoryClient initialData={initialData} />
      </Suspense>
    </ErrorBoundary>
  )
}
```

> Install `react-error-boundary` — it's a small, well-maintained wrapper around React's class-based error boundary API: `npm i react-error-boundary`.

---

## Addition 3 — Component Split (see Decision 6 above)

Already incorporated into the revised Decision 6.

---

## Migration Traps (Caught During Code Review)

These are specific patterns in `index.html` that need deliberate handling in React:

| Current pattern | React equivalent | Notes |
|---|---|---|
| `window.businesses = []` | `useState<Business[]>` | Never use `window` for app state in Next.js |
| `favorites = new Set()` | `useState<Set<string>>(new Set())` | Spread on update — see Decision 4 |
| `_fbDebounce` timer | `useMemo` dependencies | React recomputes only on dep change |
| `document.getElementById(...)` | `useRef` or controlled components | No DOM queries in React |
| `innerHTML` for cards | JSX components | `dangerouslySetInnerHTML` is the escape hatch but should not be needed |
| `localStorage` (favorites) | `useState` (in-memory for now) | Current HTML doesn't use localStorage; React state matches |
| `cardHtml()` string builder | `<BusinessCard />` component | Template literals → JSX |
| `lang` global variable | `useState<'en'\|'ta'>` in DirectoryClient | Pass as prop to components that need it |
| `i18n` object | Move to `lib/utils.ts` | Already a plain object, no changes needed |
| `categoryMap` object | Move to `lib/utils.ts` | Same |
| `_stableColorIdx(id)` | Move to `lib/utils.ts` | Pure function, no changes needed |
| `testimonials` array | `const TESTIMONIALS = [...]` at the top of the component that renders them | Static data — no need for `lib/utils.ts`; it's UI-only |
| `setPlan` / `switchTab` | Local state in pricing section component | These drive the pricing/signup section |

---

## Environment Variables

```
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

All `NEXT_PUBLIC_` — these are already exposed in the current `index.html` source code, so no security regression. Server-side REST calls use `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (no auth key required for public Firestore).

---

## What Does NOT Change

- Firestore schema — no field renames, no migrations
- Firebase project — same project, same collections
- CSS design — verbatim to `globals.css`, zero visual changes
- Vercel deployment — `next build` output deploys identically to current setup
- Form submission — same REST API endpoint, same Firestore write path

---

## Build Order (Recommended)

1. `npx create-next-app@latest` with TypeScript + App Router + Tailwind **off**
2. `npm i react-error-boundary`
3. Copy CSS → `globals.css`, define CSS variables in `:root`
4. Define `types/business.ts`
5. Move utilities to `lib/utils.ts` (`categoryMap`, `i18n`, `stableColorIdx`, etc.) — `stableColorIdx` is needed by `parseFirestoreDoc`
6. Write `lib/firestore-rest.ts` including `parseFirestoreDoc` and `fetchBusinessById` → verify it returns shaped `Business[]` with `console.log`
7. Write `lib/firebase-client.ts` + verify `onSnapshot` connects
8. Build `BusinessCard.tsx` (pure, no state — easiest first)
9. Build `DirectoryClient.tsx` with `initialData` prop + `onSnapshot` merge + `useMemo` filter + `localStorage` favorites + `fbError` banner
10. Build `app/directory/page.tsx` (Server Component with `ErrorBoundary` + `Suspense`, passes `initialData`)
11. Verify directory page renders with real data, live updates work, favorites survive refresh
12. Build remaining presentational components (`SearchBar`, `FilterRow`, `BusinessGrid`, modals)
13. Build `app/directory/[id]/page.tsx` with `generateStaticParams` + `generateMetadata` + `revalidate`
14. Add `generateMetadata` to root `layout.tsx`
15. Deploy to Vercel, verify SEO with `curl` (not browser — tests server render)

---

*FiTEN Business Directory | Next.js Migration Pre-Build Reference | June 2026*
