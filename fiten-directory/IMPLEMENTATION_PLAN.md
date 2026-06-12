# FiTEN Business Directory — Implementation Plan
**Version 3.0 | June 2026 | Status: MVP Live on Next.js**

> Live: https://fiten-directory.vercel.app (domain cutover to fiten.org pending — see [DOMAIN_CUTOVER.md](./DOMAIN_CUTOVER.md))
> Repo: https://github.com/MehanazMI/fiten-business-directory
> Design reference: [DESIGN.md](./DESIGN.md)

---

## Current State: Next.js MVP Complete

The directory shipped first as a static HTML + Firebase prototype, then was fully rewritten as a Next.js App Router application — ahead of schedule and before any meaningful traffic required it. The rewrite brings SSG with ISR, proper SEO infrastructure, TypeScript safety, a component-based architecture, and a suite of automated tests. The Firestore data layer is unchanged.

---

## What Is Live

| Feature | Status | Notes |
|---------|--------|-------|
| Business directory — Grid view | ✅ Live | Firebase real-time via `onSnapshot` |
| Business directory — Region view | ✅ Live | Groups by `region` field |
| Category filter pills | ✅ Live | Top 4 categories by count shown in filter row |
| Sidebar category list | ✅ Live | All categories with live counts |
| B2B signal filters | ✅ Live | Partner, Hire, Invest, Seeking Clients (sidebar checkboxes) |
| Women-Led filter | ✅ Live | Sidebar checkbox |
| Search (full-text) | ✅ Live | Filters on name, description, category |
| Sort | ✅ Live | PRO first, A–Z, Most Reviewed, Most Viewed |
| Business detail modal | ✅ Live | Overlay panel with full contact details |
| Business detail page `/directory/[id]` | ✅ Live | Static-generated, shareable URL, revalidates hourly |
| Favorites / saved | ✅ Live | Heart button, persisted to `localStorage` |
| Claim listing modal | ✅ Live | Writes claim request to Firestore `claims` collection |
| Add business form (modal) | ✅ Live | REST API → Firestore, live immediately on submit |
| Add business form (standalone `/form`) | ✅ Live | Same form at a direct URL |
| WhatsApp / email Connect button | ✅ Live | WhatsApp if phone present, email fallback |
| Share button | ✅ Live | Copies `/directory/[id]` link to clipboard |
| Bilingual EN / Tamil toggle | ✅ Live | Hero, search, Tamil business names |
| B2B tooltips | ✅ Live | Hover explanations on signal labels |
| PRO / Free tier distinction | ✅ Live | PRO: gold border, PRO badge, ratings display |
| Load more pagination | ✅ Live | 6 per page |
| Mobile responsive | ✅ Live | Sidebar collapses at 768px |
| Loading state | ✅ Live | React Suspense |
| Error state | ✅ Live | Banner on `onSnapshot` failure; fallback renders server data |
| SSG + ISR | ✅ Live | Pages pre-built at deploy; revalidate 1h |
| `robots.txt` | ✅ Live | Blocks design mockup files; points to sitemap |
| `sitemap.xml` | ✅ Live | All active businesses + static pages; revalidates hourly |
| Canonical URLs + Open Graph | ✅ Live | All routes; `NEXT_PUBLIC_SITE_URL` drives domain |
| LocalBusiness JSON-LD | ✅ Live | On every business detail page |
| Legacy URL redirects | ✅ Live | `/index.html` → `/directory`, `/form.html` → `/form` (308) |
| Automated test suite | ✅ Live | 176 tests across 9 files (Vitest + React Testing Library) |
| Firestore emulator dev setup | ✅ Live | `npm run dev:emulator` + `npm run seed` for isolated local dev |
| Vercel preview deployments | ✅ Live | Auto-deploy on every non-`main` push; amber banner + write guard |

## What Is NOT Yet Built

- Business owner authentication (login / manage own listing)
- Admin dashboard (currently managed via Firebase console)
- Verified FiTEN Member badge system
- Reviews and ratings submission UI (fields exist in DB, display exists)
- B2B connection requests / messaging
- Email digest
- Payment / PRO upgrade flow (Stripe)
- FiTEN event history integration
- Analytics dashboard for business owners
- Self-service profile editing
- Export CSV (existed in the legacy static HTML build; not carried into Next.js)

---

## Tech Stack (Actual)

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | Next.js 16 App Router, TypeScript | Component-based, fully type-checked |
| Rendering | SSG + ISR | Directory pages pre-built; revalidate 1h |
| Database | Firebase Firestore | Real-time, free tier generous, REST API available |
| Hosting | Vercel | Free tier, auto-deploy on every push to `main` |
| Data (build/SSR) | Firestore REST API (`lib/firestore-rest.ts`) | No SDK, no auth required (public rules) |
| Data (runtime) | Firebase JS SDK — `onSnapshot` | Live updates merge into rendered list without full re-render |
| SEO | `app/robots.ts`, `app/sitemap.ts`, `metadataBase`, JSON-LD | Domain-agnostic via `NEXT_PUBLIC_SITE_URL` |
| Tests | Vitest + React Testing Library | 176 tests, run on every pre-commit hook |
| Dev environment | Firestore emulator + Vercel preview deploys | Isolated local dev; auto preview URL per branch |
| Domain | fiten.org (pending) | Currently on `fiten-directory.vercel.app` |

---

## Architecture (Key Files)

| File | Role |
|------|------|
| `types/business.ts` | Single source of truth for the `Business` interface |
| `lib/site.ts` | Canonical site origin (`NEXT_PUBLIC_SITE_URL` → falls back to vercel.app) |
| `lib/firestore-rest.ts` | Server-side Firestore fetch via REST — no SDK, no auth |
| `lib/firebase-client.ts` | Firebase JS SDK init (guarded with `getApps()`) |
| `lib/utils.ts` | `stableColorIdx`, `categoryMap`, `i18n`, `oppLabels`, `sigClass` |
| `app/directory/page.tsx` | Server Component — fetches `initialData`, passes to `DirectoryClient` |
| `app/directory/DirectoryClient.tsx` | All state, `onSnapshot`, `useMemo` filter, composes UI |
| `app/directory/[id]/page.tsx` | SSG business detail page, `generateMetadata`, JSON-LD |
| `app/robots.ts` | `/robots.txt` |
| `app/sitemap.ts` | `/sitemap.xml` |

---

## Firestore Schema (`businesses` collection)

Fields: `businessName`, `nameTamil?`, `category`, `city`, `region`, `description`, `email`, `phone?`, `website?`, `status` (`"active"` to show), `pro`, `looking` (array of `partner|client|invest|hire`), `speaker`, `women`, `convention`, `rating`, `reviews`, `views`, `createdAt`.

`initials` and `colorIdx` are derived at read time — not stored in Firestore.

Claims go to a separate `claims` collection with fields: `businessName`, `email`, `status: "pending"`, `createdAt`.

---

## Roadmap

### Phase 1: MVP ✅ COMPLETE
Static HTML + Firebase prototype with real-time data, search, filtering, add business form, bilingual toggle.

### Phase 1b: Next.js Rewrite ✅ COMPLETE
Full rewrite as Next.js App Router app with SSG/ISR, TypeScript, component architecture, automated tests, SEO infrastructure (robots, sitemap, canonicals, JSON-LD), and domain-cutover readiness.

**Why now instead of Phase 6:** The static HTML codebase was already hard to maintain and extend. Next.js unlocks proper SEO (which the static site can't do), allows the Phase 2 auth work to use React patterns cleanly, and is still free on Vercel. The migration cost was days, not weeks.

---

### Phase 2: Business Owner Portal (Next 60 days)

The most important next step is letting business owners manage their own listings. Currently all edits go through the Firebase console.

**Deliverables:**
- Business owner login (Firebase Auth — Google or email)
- Claim flow: owner proves they own the email → gets edit access to their Firestore document
- Self-service profile editor: update description, category, website, looking signals, phone
- Upload logo / profile image (Firebase Storage → replaces initials avatar)
- Verified FiTEN Member badge: FiTEN staff sets `verified: true` in Firestore; badge appears automatically

**Implementation notes:**
- Firebase Auth is a one-package add (`firebase/auth`). `signInWithGoogle()` + `onAuthStateChanged` hook.
- The edit form reuses `AddBusinessModal`'s field structure, pre-populated from the user's document.
- Badge stays manual: FiTEN staff checks membership, flips the field in Firebase console. No automation needed yet.
- Auth guard: check `auth.currentUser.email` matches the business document's `email` field before allowing edits.

**Tech additions:** Firebase Auth, Firebase Storage  
**Cost impact:** Still within free tier for <50k MAU

---

### Phase 3: PRO Upgrade Flow (Month 3–4)

**Deliverables:**
- Stripe integration: $29/mo or $290/yr PRO tier
- Checkout flow (redirect to Stripe's hosted Checkout page)
- Webhook: Stripe → Firebase Cloud Function → sets `pro: true` on the business document
- PRO features unlock automatically: gold border, Connect button revealed, ratings display

**Implementation notes:**
- A single Firebase Cloud Function handles the Stripe webhook. This is the first server-side code in the project.
- On payment, Stripe fires the webhook; the function updates Firestore; the directory updates in real time via `onSnapshot`.

**Tech additions:** Stripe Checkout, one Firebase Cloud Function  
**Revenue unlock:** $29/mo per PRO listing

---

### Phase 4: Reviews, Ratings, B2B Signals (Month 5–6)

**Deliverables:**
- Review submission form (authenticated users only — prevents spam)
- Star rating averaged and stored per business document
- B2B connection request form: "I'm interested in [partner/client/invest]" → email to business owner
- Email notifications (Firebase Trigger Email extension)

**Implementation notes:**
- Reviews stored as subcollection: `businesses/{id}/reviews/{reviewId}`
- Connection requests write to Firestore; the Trigger Email extension fires the email
- Export CSV can be re-added here with a server-side route to protect email/phone fields

**Tech additions:** Firebase Trigger Email extension  
**Cost impact:** SendGrid free tier (100 emails/day) sufficient at this stage

---

### Phase 5: Analytics Dashboard (Month 7–8)

**Deliverables:**
- Business owner analytics page: profile views, search appearances, favorites count, connection request volume
- Weekly email digest: "5 people viewed your profile this week"

**Implementation notes:**
- Views: `increment()` a counter on card render / detail panel open
- Analytics route `/dashboard` — accessible only to authenticated listing owners (Firebase Auth guard)
- Weekly digest: scheduled Firebase Cloud Function reads view data, sends via SendGrid

**Tech additions:** Scheduled Firebase Cloud Function

---

## Immediate Actions (This Week)

1. **Merge `feat/emulator-preview-setup` → `main`** — branch is tested and ready. Vercel will auto-deploy.

2. **Connect domain** — see [DOMAIN_CUTOVER.md](./DOMAIN_CUTOVER.md) for the exact steps. Takes ~15 minutes plus DNS propagation. SEO infrastructure (robots, sitemap, canonicals, JSON-LD) is already live and will switch to `fiten.org` automatically once the env var is set.

3. **Populate the directory** — the seeded businesses are placeholders. Recruit the first 20 real businesses from the FiTEN member network via the form at `/form`.

4. **Share Firebase console access** — give the Directory Lead access so they can approve/edit listings without a developer.

5. **Announcement post** — short post to FiTEN/FeTNA communities with the link and a call to list. The form is live and takes 5 minutes.

---

## Budget (Revised)

| Component | Current | At Scale (Phase 3+) |
|-----------|---------|-------------------|
| Vercel hosting | $0 (Hobby) | $20/mo (Pro, for bandwidth) |
| Firebase Firestore | $0 (Spark) | $25/mo (Blaze, pay-as-you-go) |
| Firebase Auth | $0 | $0 |
| Firebase Storage (logos) | $0 | ~$5/mo |
| Stripe fees | $0 | 2.9% + $0.30/transaction |
| SendGrid (email) | $0 | $15/mo (Essentials) |
| **Total** | **$0/month** | **~$65/month** |

At $29/month per PRO listing, 3 PRO listings cover infrastructure costs at scale.

---

## Success Metrics

### Current Baseline
- Businesses in directory: seeded + live submissions
- Test coverage: 176 automated tests across all UI components
- Build time: ~6s (TypeScript clean, no errors)
- Page performance: SSG — near-instant first load, real-time updates in <500ms
- SEO: robots.txt, sitemap, canonicals, OG, JSON-LD all live

### Phase 2 Targets (60 days)
- Real business listings: 50+
- Business owners with claimed profiles: 20+
- Verified FiTEN Member badges issued: 10+

### Phase 3 Targets (4 months)
- PRO listings: 10+
- Monthly recurring revenue: $290+
- Form submissions per month: 20+

### Year 1 Targets
- Total listings: 350+
- Monthly active users: 4,000–5,000
- Revenue: ~$16,000

---

## Risk Register

| Risk | Status | Mitigation |
|------|--------|-----------|
| Low listing adoption | Active | Form live, businesses seeded, recruitment needed |
| Domain not connected | Active | DOMAIN_CUTOVER.md ready; 15-min task when DNS access available |
| Firebase CDN dependency | Resolved | Form uses REST API only; SDK only for real-time directory |
| File truncation on deploy | Resolved | All pushes via GitHub; Vercel auto-deploy |
| Volunteer developer bandwidth | Low | Next.js codebase is well-structured; tests give confidence to contributors |
| Fraudulent listings | Pending | Admin review via Firebase console; verified badge pending Phase 2 |
| Firestore public write rules | Pending | Currently open to any client — should add rate-limiting or reCAPTCHA before significant traffic |
| Spam submissions | Pending | `status: "active"` set on submit — tighten to `"pending"` + admin approval when listings grow |

---

*Architecture decisions: [NEXTJS_ARCHITECTURE.md](./NEXTJS_ARCHITECTURE.md)*  
*Domain cutover steps: [DOMAIN_CUTOVER.md](./DOMAIN_CUTOVER.md)*  
*Design system: [DESIGN.md](./DESIGN.md)*  
*June 2026 | FiTEN Business Directory*
