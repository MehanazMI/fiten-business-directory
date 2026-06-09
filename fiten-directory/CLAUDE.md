# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this directory is

The Next.js App Router rewrite of the FiTEN Business Directory. Deployed at **fiten-directory.vercel.app**. The legacy `index.html` + `form.html` site lives one level up at the repo root and is kept as a reference during the domain cutover.

---

## Commands

```bash
# run from this directory (fiten-directory/)
npm run dev      # dev server at http://localhost:3000
npm run build    # production build + TypeScript check
npm run start    # serve the production build locally
```

TypeScript errors surface during `npm run build` — there is no separate lint step. The build runs `generateStaticParams` against live Firestore, so it requires `.env.local`.

### Environment variables

Create `.env.local` in this directory (gitignored):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Actual values are in the Vercel project environment variables (project: `mehanazmis-projects/fiten-directory`).

---

## Architecture

### Data flow

```
Firestore (source of truth)
    │
    ├── Server fetch (build/request time)
    │   lib/firestore-rest.ts → fetchBusinesses() / fetchBusinessById()
    │   Uses Firestore REST API — no SDK, no auth required (public rules)
    │   Called by: app/directory/page.tsx (Server Component)
    │
    └── Client subscription (real-time)
        lib/firebase-client.ts → Firebase JS SDK → onSnapshot
        Called by: DirectoryClient.tsx useEffect
```

### Server / Client boundary

`app/directory/page.tsx` is a **Server Component** — fetches `initialData` via REST and passes it to `DirectoryClient`. Crawlers see real business cards on first load.

`DirectoryClient.tsx` is `'use client'` — owns all interactive state and subscribes to live Firestore updates. The `onSnapshot` handler **merges** live data into the existing list by `id` (never replaces wholesale) to avoid jarring re-renders on slow connections.

### State in `DirectoryClient`

`lang`, `activeCat`, `activeFilter`, `activeView`, `showFavs`, `favorites` (Set, persisted to `localStorage`), `currentBusiness`, `claimTarget`, `showAddModal`, `visibleCount`, `searchQuery`, `sort`, `activeOpps`. Filtering is a single `useMemo` — no debounce timers.

### Key files

| File | Role |
|------|------|
| `types/business.ts` | Single source of truth for the `Business` interface |
| `lib/firestore-rest.ts` | `parseFirestoreDoc` unwraps Firestore REST typed values (`{stringValue: "x"}` → `"x"`). Also `fetchBusinesses` and `fetchBusinessById`. |
| `lib/utils.ts` | `stableColorIdx`, `categoryMap`, `i18n`, `oppLabels`, `sigClass`, `colors`, `textColors` |
| `lib/firebase-client.ts` | Firebase JS SDK init with `getApps()` guard (prevents double-init on hot reload) |
| `app/directory/DirectoryClient.tsx` | All state + onSnapshot + useMemo filter. Composes all presentational children. |
| `app/directory/[id]/page.tsx` | `generateStaticParams` + `generateMetadata` + `revalidate = 3600` |
| `app/globals.css` | Verbatim CSS from legacy `index.html` — do not rename classes |

### Firestore schema (`businesses` collection)

Fields: `businessName`, `nameTamil?`, `category`, `city`, `region`, `description`, `email`, `phone?`, `website?`, `status` (`"active"` to show), `pro`, `looking` (array of `partner|client|invest|hire`), `speaker`, `women`, `convention`, `rating`, `reviews`, `views`, `createdAt`.

`initials` and `colorIdx` are derived at read time in `parseFirestoreDoc` / `parseDoc` — not stored in Firestore.

### Adding a business

`AddBusinessModal.tsx` and `app/form/AddBusinessStandalone.tsx` both POST directly to the Firestore REST API. The `onSnapshot` subscription picks up the new document within ~1 second automatically.

### CSS

All styles are in `app/globals.css`. Class names match the legacy `index.html` exactly — do not rename them.

---

## Reference docs (this directory)

| File | Purpose |
|------|---------|
| `NEXTJS_ARCHITECTURE.md` | Pre-build architecture decisions and rationale |
| `IMPLEMENTATION_PLAN.md` | Project roadmap, phases, and status |
| `FIREBASE_TESTING_REPORT.md` | Firebase integration test results |

---

## Deployment

Every push to `main` triggers an automatic Vercel redeploy. To deploy manually:

```bash
npx vercel --prod
```
