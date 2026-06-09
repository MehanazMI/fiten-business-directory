# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository layout

This repo has two coexisting implementations:

| Path | What it is |
|------|-----------|
| `index.html` + `form.html` | Legacy vanilla JS + Firebase site — still live at fiten.org |
| `fiten-directory/` | **Active Next.js app** — deployed at fiten-directory.vercel.app |

All new feature work goes in `fiten-directory/`. The root HTML files are kept for reference and as a fallback while the domain cutover to the Next.js app is pending.

---

## Next.js app (`fiten-directory/`)

### Commands

```bash
# all commands must be run from fiten-directory/
cd fiten-directory

npm run dev      # dev server at http://localhost:3000
npm run build    # production build + type check
npm run start    # serve the production build locally
```

TypeScript errors surface during `npm run build` — there is no separate lint step. The build also runs `generateStaticParams` against live Firestore, so it requires the env vars below.

### Environment variables

Create `fiten-directory/.env.local` (gitignored):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

All four are `NEXT_PUBLIC_` because they're used on the client. The Firebase project is `fiten-business-directory`. The actual values are in the Vercel project's environment variables.

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

`app/directory/page.tsx` is a **Server Component** — it fetches initial data via REST and passes it as `initialData` to `DirectoryClient`. This ensures crawlers see real business cards on first load.

`DirectoryClient.tsx` is `'use client'` — it owns all interactive state and subscribes to live Firestore updates. The `onSnapshot` handler **merges** live data into the existing list (by `id`) rather than replacing it wholesale, to avoid jarring re-renders on slow connections.

### State that lives in `DirectoryClient`

All filter/UI state: `lang`, `activeCat`, `activeFilter`, `activeView`, `showFavs`, `favorites` (Set, persisted to `localStorage`), `currentBusiness`, `claimTarget`, `showAddModal`, `visibleCount`, `searchQuery`, `sort`, `activeOpps`.

Filtering is a single `useMemo` over all state dependencies — no debounce timers.

### Key files

| File | Role |
|------|------|
| `types/business.ts` | Single source of truth for the `Business` interface |
| `lib/firestore-rest.ts` | `parseFirestoreDoc` — unwraps Firestore REST typed values (`{stringValue: "x"}` → `"x"`). Also `fetchBusinesses` and `fetchBusinessById`. |
| `lib/utils.ts` | `stableColorIdx`, `categoryMap`, `i18n`, `oppLabels`, `sigClass`, `colors`, `textColors` |
| `lib/firebase-client.ts` | Firebase JS SDK init with `getApps()` guard (prevents double-init on hot reload) |
| `app/directory/DirectoryClient.tsx` | All state + onSnapshot + useMemo filter. Composes all presentational children. |
| `app/directory/[id]/page.tsx` | `generateStaticParams` + `generateMetadata` + `revalidate = 3600` |
| `app/globals.css` | Verbatim CSS from legacy `index.html` — do not rename classes |

### Firestore schema (`businesses` collection)

Fields: `businessName`, `nameTamil?`, `category`, `city`, `region`, `description`, `email`, `phone?`, `website?`, `status` (`"active"` to show), `pro`, `looking` (array of `partner|client|invest|hire`), `speaker`, `women`, `convention`, `rating`, `reviews`, `views`, `createdAt`.

`initials` and `colorIdx` are derived at read time in `parseFirestoreDoc` / `parseDoc` — they are not stored in Firestore.

### Adding a business from the UI

`AddBusinessModal.tsx` and `app/form/AddBusinessStandalone.tsx` both POST directly to the Firestore REST API (`/documents/businesses?key=...`). The `onSnapshot` subscription in `DirectoryClient` picks up the new document within ~1 second — no manual refresh needed.

### CSS

All styles are in `app/globals.css`. Class names match the legacy `index.html` exactly — do not rename them. New component-specific styles can be added at the bottom of globals.css.

---

## Deployment

Production: **fiten-directory.vercel.app** (Vercel project `mehanazmis-projects/fiten-directory`)

Every push to `main` triggers an automatic Vercel redeploy. To deploy manually:

```bash
cd fiten-directory
npx vercel --prod
```

The legacy `index.html` site lives on a separate Vercel project and is unaffected by pushes to this repo.
