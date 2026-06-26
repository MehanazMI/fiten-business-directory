# Changelog

All notable changes to the FiTEN Business Directory are documented here.
Format: newest first. Each entry links to the relevant commit(s).

---

## [Unreleased]

> Pending: update privacy contact placeholder (`[privacy@fetna.org — placeholder, update before launch]`) in `/privacy` and `/terms` once FeTNA confirms the email address.

---

## June 2026

### Legal & Compliance
- **GDPR consent checkbox** added to both submission forms (`AddBusinessModal`, `AddBusinessStandalone`) — required before submitting. Consent timestamp stored in Firestore as audit trail.
- **Privacy Policy** (`/privacy`) — full GDPR rewrite: legal basis, data subject rights, IP address disclosure, Google Cloud & Vercel DPA links, one-month response commitment per GDPR Article 12.
- **Terms of Use** (`/terms`) — eligibility clause (16+), IP licence grant, dispute resolution path, governing law (Ontario, Canada), GDPR carve-out for EU users.
- All contact references unified to `fiten.org`.

### Security
- **Phase 1A** — Firestore security rules updated: all writes require Firebase Auth (`request.auth != null`).
- **Phase 1B** — Google reCAPTCHA v3 (classic, free) integrated on all submission forms. Token verified server-side before any write. Preview deployments bypass captcha (writes still blocked client-side).
- **Phase 1C** — Business submissions moved to server API route (`/api/submit-business`) using Firebase Admin SDK. Clients no longer write directly to Firestore. Includes input sanitization, email validation, category whitelist, and duplicate email detection (returns 409).
- **Phase 2A** — HTTP security headers added in `next.config.ts`: `Content-Security-Policy`, `Strict-Transport-Security` (1 year), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Phase 2D** — In-memory rate limiting on API routes: 5 req/min on `/api/submit-business`, 10 req/min on `/api/verify-captcha`, keyed by IP.
- **CSP tuning** — Added `apis.google.com`, `accounts.google.com`, `oauth2.googleapis.com`, `cdn.jsdelivr.net`, `fiten-business-directory.firebaseapp.com`, `www.google.com/recaptcha/` to appropriate CSP directives for Firebase Auth and Tabler icons.
- **Sign-in hardening** — `AuthButton` now catches `auth/popup-closed-by-user` and `auth/popup-blocked` without unhandled rejections.

### Infrastructure
- `SETUP.md` — comprehensive manual config guide covering Firebase, reCAPTCHA, Vercel, and domain setup. Includes switch-domain and switch-Firebase-project checklists.
- `scripts/service-account.json` added to `.gitignore` — never committed.
- `firebase-admin` bumped to 14.1.0.

---

## May 2026

### Features
- FeTNA 2026 promo section and standee assets added to homepage.
- Admin UI: custom claims, Firestore rules, pending approval dashboard, event actions (delete, feature), auto status from date.
- Firebase Auth integration: Google sign-in, owner dashboard, event detail polish.
- Community events page with hero, filter chips, two-column layout.
- Dynamic view tracking on business listings.
- Tamil language toggle (EN / தமிழ்).
- Favorites (saved listings) persisted to `localStorage`.
- B2B signals: partner, client, invest, hire — filterable in directory.
- Map view (region-based) alongside grid view.
- `generateStaticParams` + `revalidate = 3600` on individual listing pages for ISR.
- Firestore REST API for server-side fetches (no SDK, no auth required for reads).
- Real-time `onSnapshot` subscription in `DirectoryClient` — merges live updates without full re-render.

### Infrastructure
- Next.js App Router rewrite of legacy `index.html` / `form.html` site.
- Deployed on Vercel (`fiten-directory.vercel.app`). Preview deploys auto-generated per branch with write guard and amber banner.
- Firestore emulator support (`npm run dev:emulator`, seed script).
- Vitest test suite (246 tests across 17 files).

---

## How to update this file

Add an entry at the top of the relevant month section whenever a meaningful change is merged to `main`. Group by: Features, Security, Bug Fixes, Legal, Infrastructure. Keep entries short — one line each.
