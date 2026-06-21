# FiTEN Directory — Visual Redesign Plan
**Drafted: June 2026 | Branch: `feat/ui-redesign-aurawill-inspired` (reference only)**

> This branch contains a working proof-of-concept of the redesign.
> It is **not** the implementation branch — it is a design reference.
> A new clean branch will be cut from `main` to implement these decisions.
> This branch will be deleted once the redesign is finalised.

---

## Design Goal

Make every Tamil business feel found. The redesign replaces a cold, flat UI with a warm, community-first design that is immediately legible — you know what a business does before you click, and PRO listings are unmissable.

---

## Design Principles

| Principle | What it means |
|-----------|---------------|
| Immediate legibility | Name, category, location and description always visible on the card — no click required |
| Community warmth | Warm cream backgrounds, organic sage + amber tones. Feels handcrafted, not corporate |
| Clear tier value | PRO badge is unmissable. Amber accent signals premium tier without being heavy-handed |

---

## Colour System

| Token | Hex | Role |
|-------|-----|------|
| `--cream-bg` | `#FDF7ED` | Page background, nav background |
| `--cream2` | `#F7F0E2` | Search strip, tinted surfaces |
| `--sage-avatar-zone` | `#E8EFE4` | Card avatar zone (Healthcare default), signal tags |
| `--sage-avatar` | `#5B7A5C` | Avatar circle (Healthcare default), active filter pills |
| `--sage-tag-fg` | `#3D5C3F` | Text on sage-tinted tags |
| `--amber-light` | `#FBF0D8` | PRO badge background, amber-group signal tags |
| `--amber-deep` | `#B45309` | CTA button, saved heart, stat numbers |
| `--card-divider` | `#F2EBE0` | Card footer divider line |

### Category Avatar Colours

Each business category gets its own avatar zone tint + circle colour. This gives the grid visual variety without extra labels.

| Category | Zone | Circle |
|----------|------|--------|
| Healthcare | `#E8EFE4` | `#5B7A5C` (sage) |
| Tech | `#E6ECF5` | `#3B5998` (indigo) |
| Food | `#FEF3E2` | `#C07020` (amber-brown) |
| Legal | `#EDE8F5` | `#5C4BA0` (plum) |
| Finance | `#E5F0EE` | `#2D7A6E` (teal) |
| Education | `#F5EBE0` | `#8B5E3C` (warm brown) |
| Real Estate | `#F0EDE8` | `#7B5E45` (clay) |
| Retail | `#F5ECE8` | `#9B4B2E` (terracotta) |
| Entertainment | `#F0E8F5` | `#7A4BA0` (purple) |
| Services | `#EEF0F5` | `#4A5568` (slate) |

---

## Typography

| Font | Role | Load via |
|------|------|----------|
| **Laila** (weight 600, 700) | Logo, hero headline, all card business names | Google Fonts |
| **Plus Jakarta Sans** (weight 400, 500, 600) | All body, UI, labels, descriptions, tags | Google Fonts |

Both fonts are not yet loaded in the codebase — this is a **Step 3** implementation task.

---

## Business Card — Confirmed Design Decisions

These five decisions are locked. The card is the most important component in the directory.

### 1. Large avatar zone — visual anchor
- **104px** top strip, full card width
- **60px** circle centred in the zone
- If `logoUrl` is set: contained `<img>` (`object-fit: contain`, `padding: 12px`) on the tinted zone
- If no logo: `ti-building-store` icon in a semi-transparent circle on the tinted zone
- Category colour pairs applied to zone background + circle (see table above)

### 2. Clear 4-tier hierarchy
Name → Category → Location/badges → Description. Each tier is visually distinct:
- **Name**: Laila 14px/700, near-black `#1A1A1A`
- **Category**: Plus Jakarta Sans 10.5px/500, muted `#777`
- **Location**: Plus Jakarta Sans 9.5px/400, light `#AAA` — includes "· Women-led" inline
- **Description**: Plus Jakarta Sans 10.5px/400, `#555`, 2-line clamp

### 3. Description always visible
`-webkit-line-clamp: 2` — replaces the hidden-until-modal pattern. Business purpose is scannable before any click.

### 4. Subtle shadow, no border
```css
box-shadow: rgba(0,0,0,0.06) 0px 4px 14px;
border: none;
border-radius: 12px;
```
Hover: `rgba(0,0,0,0.12) 0px 8px 22px` + `translateY(-3px)`.

### 5. PRO badge — unmissable
- Absolute position: `top: 9px; right: 9px; z-index: 2`
- Amber-on-amber-tint: `background: #FBF0D8; color: #7A4500`
- **Whole card is clickable** — no View button
- Heart button: muted `#D0C8BE` default → amber `#B45309` when saved
- Rating sits right-aligned in the footer (replaces the View button slot)

---

## B2B Signal Tags

Two groups, two colours:

| Group | Colour | Signals |
|-------|--------|---------|
| Collaborative (sage) | `background: #E8EFE4; color: #3D5C3F` | Partner, Seeking Clients, Hiring, Women-led |
| High-intent (amber) | `background: #FBF0D8; color: #7A4500` | Seeking Investment, Speaker, FeTNA Conv. |

Emoji removed from all labels. Text only.

---

## Hero & Header

Replace the dark stone header with a warm cream header that stays in the same colour family as the page.

### Nav bar
- Background: `var(--cream-bg)` — matches the page, no dark band
- Logo: Laila serif, `Fi` in near-black, `TEN` in sage `#5B7A5C`
- "Business Directory" subtitle: 9px uppercase muted label beside the logo
- Language toggle: cream2 tinted pill, white active state
- CTA button: amber `#B45309` with white text

### Brand strip (hero)
- Eyebrow: 9px uppercase sage label — "Tamil Business Network"
- Headline: Laila 28px/700 — "Connect with **Tamil Businesses** Worldwide" (sage accent on "Tamil Businesses")
- Subline: Plus Jakarta Sans 13px, muted
- Stats: Laila 26px/700 in **amber** `#B45309` (currently red — change to amber for consistency)
- Stats labels: 9px uppercase muted

### Search strip
- Background: `var(--cream2)` — slightly darker than the hero, creates a natural separation
- Search bar: white background, 1.5px sage-focus border, near-black Search button

### Filter row
- Background: white
- Active pill: sage `#5B7A5C` solid fill
- Saved pill: amber tint `#FBF0D8` with amber text and heart icon
- Grid/Region toggle: sage active state
- Remove all red/teal/stone-dark colour references from this row

---

## Logo / Profile Image Support

`logoUrl?: string` added to `Business` interface and Firestore schema.

- **With logo**: `<img object-fit: contain>` padded within the category-tinted avatar zone — works for any logo shape (horizontal, square, stacked)
- **Without logo**: `ti-building-store` icon in a soft semi-transparent circle on the tinted zone
- **Future**: Firebase Storage file upload (Phase 2) — currently accepts a URL pasted into the form

Form fields added: "Logo / profile image URL (optional)" in both `AddBusinessModal` and `AddBusinessStandalone`.

---

## What This Branch Has Built (Proof-of-Concept)

| Area | Status | Files changed |
|------|--------|---------------|
| CSS tokens (cream, sage, amber) | ✅ Done | `globals.css` |
| Card structure (avatar zone + 4-tier hierarchy) | ✅ Done | `BusinessCard.tsx`, `globals.css` |
| Category avatar colours | ✅ Done | `BusinessCard.tsx` |
| Signal tags (sage/amber, no emoji) | ✅ Done | `globals.css`, `utils.ts` |
| PRO badge (absolute, amber) | ✅ Done | `BusinessCard.tsx`, `globals.css` |
| Heart (muted → amber on save) | ✅ Done | `globals.css` |
| No View button (whole card clickable) | ✅ Done | `BusinessCard.tsx` |
| Rating in footer | ✅ Done | `BusinessCard.tsx` |
| `logoUrl` field (type + Firestore + form) | ✅ Done | `types/business.ts`, `firestore-rest.ts`, `DirectoryClient.tsx`, both forms |
| Logo image display / placeholder icon | ✅ Done | `BusinessCard.tsx`, `globals.css` |
| Hero/header redesign | ⏳ Pending | `DirectoryClient.tsx`, `globals.css` |
| Laila + Plus Jakarta Sans fonts | ⏳ Pending | `app/layout.tsx` |
| Modal + sidebar styling updates | ⏳ Pending | `globals.css` |

---

## Implementation Plan (New Branch)

Cut a new branch from `main`. Do **not** copy code from this branch — use it as a design reference only. Implement clean.

### Step 1 — CSS tokens + body background
Add the new CSS variables to `:root` in `globals.css`. Update `body` background to `var(--cream-bg)`.

### Step 2 — Business card
Rewrite `BusinessCard.tsx` with the new structure (avatar zone → details block). Add `logoUrl` support. Update card CSS classes.

### Step 3 — Signal tags
Update `oppLabels` in `utils.ts` (remove emoji). Update signal CSS classes to sage/amber palette.

### Step 4 — Fonts
Add Google Fonts import to `app/layout.tsx`. Apply Laila to card names and hero headline. Apply Plus Jakarta Sans as the new `--font-sans`.

### Step 5 — Hero + header
Update `DirectoryClient.tsx` header HTML and brand strip. Update `globals.css` for nav, brand strip, search strip, filter row.

### Step 6 — B2B logo field
Add `logoUrl` to `types/business.ts`, both parsers, and both forms.

### Step 7 — Polish
Modal colour updates (amber CTA, sage accents). Sidebar active state. Footer. Run full test suite. Visual QA on mobile.

---

## Files To Change (Implementation Branch)

| File | What changes |
|------|-------------|
| `app/layout.tsx` | Google Fonts `<link>` |
| `app/globals.css` | New CSS vars, card classes, signal classes, nav/hero/search/filter styles, modal updates |
| `app/directory/BusinessCard.tsx` | Full structural rewrite |
| `app/directory/DirectoryClient.tsx` | Header + brand strip HTML |
| `lib/utils.ts` | `oppLabels` — remove emoji |
| `types/business.ts` | Add `logoUrl?: string` |
| `lib/firestore-rest.ts` | Parse `logoUrl` |
| `app/directory/AddBusinessModal.tsx` | Logo URL field |
| `app/form/AddBusinessStandalone.tsx` | Logo URL field |

**Do not change:** Business logic, Firestore schema, modals (structure only), test files, routing, SEO, emulator setup.

---

*Design sessions: June 2026 | FiTEN Business Directory*
