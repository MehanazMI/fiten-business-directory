# FiTEN Business Directory — Implementation Plan
**Version 2.0 | June 2026 | Status: MVP Live**

> Live: https://fiten-business-directory.vercel.app  
> Repo: https://github.com/MehanazMI/fiten-business-directory  
> Design reference: [DESIGN.md](./DESIGN.md)

---

## What Changed Since v1.4

The strategic vision in v1.4 stands. The technology approach was deliberately simplified for the MVP. Instead of Next.js + PostgreSQL + Algolia (a 3–6 month build requiring a full-stack developer), the MVP was built in days as static HTML + Firebase Firestore + Vercel. This is not a compromise — it's the right architecture for this stage.

**Why the simpler stack:**
- Zero infrastructure management. Vercel + Firebase handle scaling, uptime, and security automatically.
- Real-time updates out of the box. When a new business is submitted, it appears in the directory instantly — no cron jobs, no cache busting, no redeploys.
- No backend server to maintain. The Firestore REST API is called directly from the browser.
- The full stack runs for under $5/month until the directory has thousands of listings and thousands of daily users. PostgreSQL + Algolia + a Node.js server would cost $100+/month from day one.
- Any React/Next.js rewrite can be done later by swapping out the frontend while keeping the same Firestore data.

---

## Current State: MVP Complete

### What Is Live

| Feature | Status | Notes |
|---------|--------|-------|
| Business directory (grid view) | ✅ Live | Firebase real-time, 9 seeded businesses |
| Business directory (region view) | ✅ Live | Groups by region |
| Search (full-text) | ✅ Live | Name, description, category |
| Category filter | ✅ Live | Tech, Healthcare, Finance, Legal, Food, Education |
| B2B signal filters | ✅ Live | Partner, Hire, Invest, PRO, Speaker, Women-Led, FeTNA Conv. |
| Sort (PRO first, A-Z, connected, newest) | ✅ Live | |
| Business detail panel | ✅ Live | Overlay modal with full info |
| Favorites / saved | ✅ Live | In-session, heart button on cards |
| Claim listing modal | ✅ Live | Email-based claim flow |
| Add business form | ✅ Live | REST API → Firestore, live immediately |
| Bilingual EN / Tamil toggle | ✅ Live | i18n for hero, search, Tamil names |
| Export CSV | ✅ Live | Downloads current filtered results |
| Load more pagination | ✅ Live | 6 per page |
| PRO / Free tier distinction | ✅ Live | PRO: gold border, View button, ratings |
| Mobile responsive | ✅ Live | Sidebar hides at 768px |
| Loading state | ✅ Live | Spinner while Firebase loads |
| Error state | ✅ Live | Clear message if Firebase fails |

### What Is NOT Yet Built
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

### Tech Stack (Actual)

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Static HTML + CSS + Vanilla JS | No build step, instant deploy, zero dependencies |
| Database | Firebase Firestore | Real-time, free tier generous, REST API available |
| Hosting | Vercel | Free tier, instant deploy from GitHub, CDN |
| Form submission | Firestore REST API (fetch) | No SDK dependency, no CDN risk |
| Real-time sync | Firebase JS SDK (onSnapshot) | Directory updates live when DB changes |
| Domain | fiten.org (pending) | Currently on vercel.app subdomain |

### Data Model (Firestore `businesses` collection)

```
{
  businessName:  string   // required, display name
  nameTamil:     string   // optional, Tamil name for bilingual display
  category:      string   // form value: "Technology", "Food & Beverage", etc.
  city:          string   // location display
  region:        string   // "North America" | "South Asia" | "Global"
  description:   string   // about text
  email:         string   // contact (not public)
  phone:         string   // contact (not public)
  website:       string   // linked in detail panel
  status:        string   // "active" to show; anything else hides it
  pro:           boolean  // PRO badge, gold border, full detail view
  looking:       array    // ["partner","client","invest","hire"]
  speaker:       boolean  // Speaker badge
  women:         boolean  // Women-Led badge
  convention:    boolean  // FeTNA Conv. badge
  rating:        number   // 0-5, shown for PRO listings
  reviews:       number   // review count
  views:         number   // view count for analytics badge
  createdAt:     string   // ISO timestamp
}
```

To edit any field: Firebase console → Firestore → businesses → [document].

---

## Revised Roadmap

### Phase 1: MVP ✅ COMPLETE
Static directory with real-time Firebase data, search, filtering, add business form, bilingual toggle. Live on Vercel.

**Actual timeline:** ~3 weeks (vs. 90 days planned)  
**Actual cost:** $0 (free tiers for Firestore + Vercel)

---

### Phase 2: Business Owner Portal (Next 60 days)

The most important next step is letting business owners manage their own listings. Currently all edits go through the Firebase console.

**Deliverables:**
- Business owner login (Firebase Auth — Google / email)
- "Claim listing" flow: owner proves they own an email → gets edit access to their document
- Self-service profile editor: update description, category, website, looking signals
- Upload logo / profile image (Firebase Storage)
- Verified FiTEN Member badge: FiTEN staff marks `verified: true` in Firestore; badge appears automatically

**Implementation notes:**
- Firebase Auth is already in the project dependencies. Adding `signInWithGoogle()` and `onAuthStateChanged` is a small addition to index.html.
- The edit form can reuse form.html's field structure, pre-populated from Firestore.
- Badge verification stays manual: FiTEN staff checks membership, sets `verified: true` in Firebase console. No automation needed yet.

**Tech additions:** Firebase Auth, Firebase Storage (logo upload)  
**Cost impact:** Still within free tier for <50k MAU

---

### Phase 3: PRO Upgrade Flow (Month 3–4)

Turn the PRO / Free distinction into a real paid tier.

**Deliverables:**
- Stripe integration: $29/mo or $290/yr PRO tier
- Checkout flow embedded in the directory (redirect to Stripe Checkout)
- Webhook: Stripe → Firebase Function → sets `pro: true` on the business document
- PRO features unlocked automatically on payment: gold border, View button, ratings display, analytics badge

**Implementation notes:**
- A single Firebase Cloud Function handles the Stripe webhook. This is the first server-side code in the project.
- Stripe Checkout requires no custom payment UI — redirect to Stripe's hosted page.
- On successful payment, Stripe fires the webhook; the function updates Firestore; the directory updates in real time.

**Tech additions:** Stripe Checkout, one Firebase Cloud Function  
**Revenue unlock:** $29/mo per PRO listing

---

### Phase 4: Reviews, Ratings, B2B Signals (Month 5–6)

**Deliverables:**
- Review submission form (authenticated users only — prevents spam)
- Star rating averaged and stored on each business document
- B2B connection request: "I'm interested in [partner/client/invest]" → sends email to business owner
- Email notification system (Firebase Extension: Trigger Email from Firestore)

**Implementation notes:**
- Reviews are stored as a subcollection: `businesses/{id}/reviews/{reviewId}`
- Connection requests write to Firestore; the Trigger Email extension fires an email to the owner
- Email templates are configurable in Firebase console — no code needed for copy changes

**Tech additions:** Firebase Trigger Email extension  
**Cost impact:** SendGrid free tier (100 emails/day) is sufficient at this stage

---

### Phase 5: Analytics Dashboard (Month 7–8)

**Deliverables:**
- Business owner analytics page: profile views, search appearances, favorites count, connection request volume
- Weekly email digest: "5 people viewed your profile this week"

**Implementation notes:**
- Views/impressions: increment a counter in Firestore each time a card renders or detail panel opens (using `increment()`)
- Analytics page is a new route `/dashboard` accessible only to authenticated listing owners
- Weekly digest: scheduled Firebase Cloud Function reads view data, sends summary email via SendGrid

**Tech additions:** Scheduled Firebase Cloud Function (weekly digest)

---

### Phase 6: Scale Migration (When Needed)

The static HTML + Firestore stack has a clear ceiling: when the directory exceeds ~5,000 businesses, client-side filtering becomes slow and full-text search quality degrades. At that point, migrate to:

- **Frontend:** Next.js (App Router) — same Firestore backend, React components replace HTML strings
- **Search:** Algolia (sync Firestore → Algolia via Cloud Function trigger). Full-text, typo-tolerant, Tamil-script search.
- **Backend:** Firebase Functions replace the need for a separate Node.js server

**Migration strategy:** The Firestore schema does not change. The frontend is a swap. All business data, user accounts, and PRO subscriptions stay intact.

**Trigger for migration:** >1,000 daily active users OR directory exceeds 2,000 listings, whichever comes first.

---

## Immediate Actions (This Week)

1. **Connect domain:** Point fiten.org (or directory.fiten.org) to the Vercel deployment. Takes 10 minutes.

2. **Populate the directory:** The 9 seeded businesses are placeholder data. Recruit the first 20 real businesses from the FiTEN member network. Use the form at `/form` — each submission appears immediately.

3. **Set up Firebase console access:** Share Firebase project access with the Directory Lead so they can approve/edit listings without needing a developer.

4. **Announcement post:** Short announcement to FiTEN/FeTNA communities with the link and a call to list their business. The form is live and takes 5 minutes.

---

## Budget (Revised)

| Component | Current | At Scale (Phase 3+) |
|-----------|---------|-------------------|
| Vercel hosting | $0 (free tier) | $20/mo (Pro, for bandwidth) |
| Firebase Firestore | $0 (free tier) | $25/mo (Blaze, pay-as-you-go) |
| Firebase Auth | $0 | $0 |
| Firebase Storage (logos) | $0 free tier | ~$5/mo |
| Stripe fees | 0 | 2.9% + $0.30/transaction |
| SendGrid (email) | $0 free tier | $15/mo (Essentials) |
| Algolia (Phase 6) | $0 | $50/mo (Grow) |
| **Total** | **$0/month** | **~$115/month** |

At $29/month per PRO listing, 4 PRO listings cover infrastructure costs at scale. The economics are strong.

---

## Success Metrics (Updated)

### Phase 1 Baseline (current)
- Businesses in directory: 9 (seeded) + submissions via form
- Form submissions: working end-to-end, real-time sync confirmed
- Performance: <1s page load, real-time updates in <500ms

### Phase 2 Targets (60 days)
- Real business listings: 50+
- Business owners with claimed profiles: 20+
- Verified FiTEN Member badges issued: 10+

### Phase 3 Targets (4 months)
- PRO listings: 10+
- Monthly recurring revenue: $290+
- Form submissions per month: 20+

### Year 1 Targets (unchanged from v1.4)
- Total listings: 350+
- Monthly active users: 4,000–5,000
- Revenue: ~$16,000

---

## Risk Register (Updated)

| Risk | Status | Mitigation |
|------|--------|-----------|
| Low listing adoption | Active | Form live, 9 businesses seeded, recruitment needed |
| Form submission failures | Resolved | REST API + `type="button"` fix deployed June 2026 |
| Category filter freeze | Resolved | Debounced Firebase + `window.businesses` fixed June 2026 |
| File truncation on deploy | Resolved | All pushes go via GitHub API, not Linux mount |
| Firebase CDN dependency | Resolved | Form uses REST API only; SDK only for real-time directory |
| Volunteer developer bandwidth | Active | Codebase simplified to vanilla HTML — any developer can contribute |
| Fraudulent listings | Pending | Admin review via Firebase console; verification badge pending Phase 2 |
| Domain not connected | Pending | Still on vercel.app subdomain |

---

*Previous version: [archive/proposals/FiTEN_BusinessDirectory_FullStrategy_v1.4.md](./archive/proposals/FiTEN_BusinessDirectory_FullStrategy_v1.4.md)*  
*Design system: [DESIGN.md](./DESIGN.md)*  
*June 2026 | FiTEN Business Directory*
