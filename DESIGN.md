# FiTEN Business Directory — Design System

> Live site: https://fiten-business-directory.vercel.app  
> Repository: https://github.com/MehanazMI/fiten-business-directory  
> Stack: Static HTML · Firestore REST API · Vercel

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--red` | `#8B1A1A` | Primary brand, headers, CTAs, active states |
| `--red-dk` | `#6B1414` | Hover states for red elements |
| `--red-dkk` | `#4A0E0E` | Deep accent, gradient endpoints |
| `--gold` | `#C69400` | Secondary accent, PRO badges, highlights |
| `--gold-lt` | `#FFF8E7` | Gold tint backgrounds (stats bar, testimonials) |
| `--teal` | `#006B75` | Category labels, verified badges, partner signals |
| `--border` | `#E8E8E8` | Dividers, card borders, input borders |
| `--text` | `#1A1A1A` | Primary body text |
| `--text2` | `#555555` | Secondary text, descriptions |
| `--text3` | `#888888` | Tertiary text, metadata, placeholders |
| Background | `#F5F7FA` | Page background |
| Surface | `#FFFFFF` | Cards, sidebar, modals |

### B2B Signal Colors

| Signal | Background | Text |
|--------|-----------|------|
| Partner | `rgba(0,107,117,0.12)` | `#005560` |
| Client | `rgba(198,148,0,0.12)` | `#8B6500` |
| Investment | `rgba(139,26,26,0.12)` | `--red` |
| Hiring | `rgba(39,80,10,0.12)` | `#27500A` |
| Speaker | `rgba(198,148,0,0.15)` | `#8B6500` |
| Women-Led | `rgba(180,60,120,0.12)` | `#8B1A5E` |
| FeTNA Conv. | `rgba(139,26,26,0.08)` | `--red` + border |

---

## Typography

Font stack: `system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif`

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Hero H1 | 2.8rem | 700 | Letter-spacing: -0.5px, gold `<em>` |
| Section heading | 1.6rem | 700 | Letter-spacing: -0.3px |
| Card name | 0.95rem | 700 | Truncated, letter-spacing: -0.2px |
| Body text | 0.95rem | 400 | Line-height: 1.6 |
| Category/meta | 0.8rem | 600 | Teal color |
| Signal badges | 0.75rem | 600 | |
| Stats number | 1.8rem | 700 | Red, animated on load |
| Stat label | 0.8rem | 600 | Uppercase, letter-spacing: 0.6px |
| Sidebar title | 0.75rem | 700 | Uppercase, letter-spacing: 0.8px |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 3px rgba(0,0,0,0.05)` | Cards (resting) |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.08)` | Header, active buttons |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.12)` | Hover cards, search bar |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` | Modals, detail panel |

---

## Layout

### Page Structure
```
┌──────────────────────────────────────────┐
│  HEADER (sticky, z-index: 100)           │
├──────────────────────────────────────────┤
│  HERO (gradient red)                     │
├──────────────────────────────────────────┤
│  SEARCH (max-width: 620px, centered)     │
├──────────────────────────────────────────┤
│  STATS BAR (gold tint)                   │
├──────────────────────────────────────────┤
│  FILTER ROW (white, sticky-ish)          │
├────────────┬─────────────────────────────┤
│  SIDEBAR   │  BUSINESS GRID              │
│  200px     │  auto-fill, minmax(250px)   │
├────────────┴─────────────────────────────┤
│  TESTIMONIALS (gold tint)                │
├──────────────────────────────────────────┤
│  PRICING (gold border)                   │
├──────────────────────────────────────────┤
│  CTA SECTION (gradient red)              │
├──────────────────────────────────────────┤
│  FOOTER (dark #1A1A1A)                   │
└──────────────────────────────────────────┘
```

### Breakpoints
| Breakpoint | Behavior |
|-----------|---------|
| `≤1024px` | Sidebar narrows to 160px |
| `≤768px` | Sidebar hidden, single-column grid, mobile nav |

### Grid
- Business grid: `repeat(auto-fill, minmax(250px, 1fr))`, gap `1.3rem`
- Main layout: `200px 1fr`, max-width `1400px`
- Stats bar: flex, gap `3rem`, centered
- Footer: `1.5fr 1fr 1fr`, gap `2rem`

---

## Components

### Business Card
```
┌─────────────────────────────────┐
│ ★ PRO Member    🔥 312 views    │  ← pro-banner (gold border)
├─────────────────────────────────┤
│ [AK]  AccuKnox Cloud Security   │
│       Tech                      │  ← biz-avatar + biz-info
│       📍 Silicon Valley, CA    │
├─────────────────────────────────┤
│ 🤝 Business Partners  💼 Invest │  ← b2b-signals
├─────────────────────────────────┤
│ Cloud-native zero-trust...      │  ← card-desc
├─────────────────────────────────┤
│ ★★★★★ 4.9 · 42   [View]        │  ← card-footer
└─────────────────────────────────┘
```
- Hover: `translateY(-4px)`, shadow-lg, red border tint
- PRO card: 1.5px gold border
- Page size: 6 cards, Load more +6

### Sidebar
- Category list with active left-border indicator
- B2B filter checkboxes (Partner, Hire, Invest)
- Additional checkboxes: PRO, Speaker, Women-Led, FeTNA Conv.
- `position: sticky`, `max-height: calc(100vh - 200px)`

### Detail Overlay
- Fixed overlay, `rgba(0,0,0,0.5)` backdrop
- Panel: 90% width, max 500px, border-radius 1rem
- Sections: header (avatar + name), body (about, signals, website, reviews), footer (connect + share)
- Closes on backdrop click or Escape key

### Claim Modal
- Centered overlay panel, 420px max-width
- Email input → success state
- Closes on backdrop click or × button

### Toast Notifications
- Fixed bottom-right, z-index 2000
- Types: `ok` (teal), `info` (dark teal), `heart` (red)
- Slide-in animation, auto-dismiss after 2.6s

---

## Animations

| Name | Duration | Trigger |
|------|---------|---------|
| Stats counter | 1600ms, cubic ease-out | Page load |
| `pulse` | 1.8s infinite | Eyebrow dot |
| `slideIn` | 300ms | Toast appear |
| Card hover | 250ms transition | Mouse enter |
| `revealIn` | 600ms forwards | Scroll reveal (.rv-in) |
| `spin` | 1s linear infinite | Loading spinner |

---

## Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.html` | Main business directory |
| `/form` | `form.html` | Add a business (REST API → Firestore) |

---

## Firebase / Data Architecture

### Firestore Collection: `businesses`

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `businessName` | string | Form | Display name |
| `nameTamil` | string | Admin | Tamil name (optional) |
| `category` | string | Form | Raw form value (e.g. "Food & Beverage") |
| `city` | string | Form | Location display |
| `region` | string | Admin | "North America", "South Asia", "Global" |
| `description` | string | Form | About text |
| `email` | string | Form | Contact (not displayed publicly) |
| `phone` | string | Form | Contact (not displayed publicly) |
| `website` | string | Form | Linked in detail panel |
| `status` | string | Form/Admin | `"active"` to show, anything else to hide |
| `pro` | boolean | Admin | PRO badge, gold border, View button |
| `looking` | array | Admin | `["partner","client","invest","hire"]` |
| `speaker` | boolean | Admin | Speaker badge |
| `women` | boolean | Admin | Women-Led badge |
| `convention` | boolean | Admin | FeTNA Conv. badge |
| `rating` | number | Admin | 0–5, shown for PRO |
| `reviews` | number | Admin | Review count |
| `views` | number | Admin | View count for analytics badge |
| `createdAt` | string/timestamp | Form | ISO date string |

### Category Mapping (form → display)
| Form value | Display category (sidebar filter) |
|-----------|----------------------------------|
| `Technology` | `Tech` |
| `Healthcare` | `Healthcare` |
| `Finance` | `Finance` |
| `Food & Beverage` | `Food` |
| `Legal` | `Legal` |
| `Education` | `Education` |
| `Retail` | `Retail` |
| `Real Estate` | `Real Estate` |
| `Services` | `Services` |
| `Entertainment` | `Entertainment` |
| `Other` | `Other` |

### Real-time Sync
- `onSnapshot` listener on the `businesses` collection
- 250ms debounce to prevent burst re-renders
- Deterministic color assignment via `docId` hash (never randomized)
- Calls `filterBiz()` on update to preserve active filter state

### Form Submission
- Direct `fetch()` POST to Firestore REST API
- No Firebase JS SDK (eliminates CDN dependency)
- `type="button"` with `onclick="submitBusiness()"` (avoids native form submission)
- Full HTML5 validation via `form.checkValidity()` before fetch

---

## Color Palette — Business Cards

Cards use a fixed 8-color palette assigned deterministically by Firestore `docId` hash:

| Index | Background | Text |
|-------|-----------|------|
| 0 | `#E6F1FB` | `#0C447C` (blue) |
| 1 | `#EAF3DE` | `#27500A` (green) |
| 2 | `#FAEEDA` | `#633806` (orange) |
| 3 | `#EEEDFE` | `#3C3489` (purple) |
| 4 | `#E1F5EE` | `#085041` (teal) |
| 5 | `#FAECE7` | `#712B13` (dark orange) |
| 6 | `#F1EFE8` | `#444444` (neutral) |
| 7 | `#FBEAF0` | `#72243E` (rose) |

---

## Bilingual Support

Two languages supported: English (`en`) and Tamil (`ta`).

Translated elements:
- Hero title and subtitle
- Search placeholder
- Business name (if `nameTamil` field present in Firestore)
- Region view names

Toggle: Header EN / தமிழ் buttons call `setLang(l)`.

---

## File Structure

```
fiten-business-directory/
├── index.html          # Main directory page
├── form.html           # Add business form
├── vercel.json         # Routing config
├── package.json        # Project metadata
├── DESIGN.md           # This file
├── docs/               # Documentation
└── archive/            # Previous versions (mockups, proposals)
    ├── mockups/        # Design iterations v1–v4
    └── proposals/      # Pitch decks and strategy docs
```
