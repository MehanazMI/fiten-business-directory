# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this directory is

The Next.js App Router rewrite of the FiTEN Business Directory. Deployed at **fiten-directory.vercel.app**. The legacy `index.html` + `form.html` site lives one level up at the repo root and is kept as a reference during the domain cutover.

---

## Commands

```bash
# run from this directory (fiten-directory/)
npm run dev            # dev server → production Firestore
npm run dev:emulator   # dev server → local Firestore emulator
npm run seed           # seed emulator with 6 test businesses
npm run build          # production build + TypeScript check
npm run start          # serve the production build locally
npm test               # run 176 Vitest tests
```

TypeScript errors surface during `npm run build` — there is no separate lint step. The build runs `generateStaticParams` against live Firestore, so it requires `.env.local`.

### Environment variables

`.env.local` (gitignored) — actual values in Vercel project (`mehanazmis-projects/fiten-directory`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Uncomment to run against the local Firestore emulator:
# NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
```

All 4 Firebase vars are set in Vercel for **Production, Preview, and Development** environments.

---

## Dev environments

### Local against emulator (safe, isolated)
```bash
# Terminal 1
npx firebase emulators:start --only firestore   # UI at http://localhost:4000

# Terminal 2 — seed once per emulator start
npm run seed

# Terminal 3
npm run dev:emulator   # app at http://localhost:3000
```
One-time: `npm install -g firebase-tools && firebase login`

### Local against production (default)
```bash
npm run dev
```

### Vercel preview deploys
Every push to a non-`main` branch auto-generates a preview URL.
- Reads real production Firestore data (good for visual review)
- Writes are blocked: `AddBusinessModal`, `ClaimModal`, `AddBusinessStandalone` all show "Form submissions are disabled on preview deployments." when `NEXT_PUBLIC_VERCEL_ENV === 'preview'`
- A sticky amber banner at the top of every page identifies preview deploys

---

## Architecture

### Data flow

```
Firestore (source of truth)
    │
    ├── Server fetch (build/request time)
    │   lib/firestore-rest.ts → fetchBusinesses() / fetchBusinessById()
    │   Uses Firestore REST API — no SDK, no auth required (public rules)
    │   Emulator-aware: uses http://localhost:8080 when NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST is set
    │   Called by: app/directory/page.tsx (Server Component)
    │
    └── Client subscription (real-time)
        lib/firebase-client.ts → Firebase JS SDK → onSnapshot
        Emulator-aware: connectFirestoreEmulator() called on first init when env var is set
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
| `lib/firestore-rest.ts` | Server-side Firestore REST fetch. Emulator-aware via `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`. |
| `lib/firebase-client.ts` | Firebase JS SDK init + `connectFirestoreEmulator` on first init when env var set |
| `lib/utils.ts` | `stableColorIdx`, `categoryMap`, `i18n`, `oppLabels`, `sigClass`, `colors`, `textColors` |
| `app/layout.tsx` | Root layout — renders amber preview banner when `NEXT_PUBLIC_VERCEL_ENV === 'preview'` |
| `app/directory/DirectoryClient.tsx` | All state + onSnapshot + useMemo filter. Composes all presentational children. |
| `app/directory/[id]/page.tsx` | `generateStaticParams` + `generateMetadata` + `revalidate = 3600` |
| `app/globals.css` | Verbatim CSS from legacy `index.html` — do not rename classes |
| `firebase.json` | Firestore emulator config (port 8080, UI port 4000) |
| `firestore.rules` | Firestore security rules (deployed via `firebase deploy --only firestore:rules`) |
| `scripts/seed-emulator.mjs` | Seeds 6 test businesses into the local emulator |

### Firestore schema (`businesses` collection)

Fields: `businessName`, `nameTamil?`, `category`, `city`, `region`, `description`, `email`, `phone?`, `website?`, `status` (`"active"` to show), `pro`, `looking` (array of `partner|client|invest|hire`), `speaker`, `women`, `convention`, `rating`, `reviews`, `views`, `createdAt`.

`initials` and `colorIdx` are derived at read time in `parseFirestoreDoc` / `parseDoc` — not stored in Firestore.

### Adding a business

`AddBusinessModal.tsx` and `app/form/AddBusinessStandalone.tsx` both POST directly to the Firestore REST API. The `onSnapshot` subscription picks up the new document within ~1 second automatically. Both are write-guarded on preview deploys.

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
vercel --prod
```

Vercel CLI is installed globally (`npm i -g vercel`). Auth is already configured for `mehanazmi`.

### Branch / environment flow

```
feature branch → push → Vercel preview deploy (amber banner, writes blocked)
                      ↓ merge to main
               → Vercel production deploy (no banner, writes live)
```
