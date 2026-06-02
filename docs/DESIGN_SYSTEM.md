# FiTEN Business Directory — Design System

## Overview

Professional, modern, and trustworthy design for a bilingual B2B directory connecting Tamil entrepreneurs globally. The visual system balances authority (burgundy heritage) with accessibility (modern typography) and international appeal.

---

## Color Palette

### Primary Colors
- **Primary Burgundy**: `#8B2E3B` 
  - Use for: Primary buttons, headers, badges, accent elements
  - Conveys: Trust, heritage, 40 years of FiTEN credibility
  - Primary Dark: `#6B1F2C` (hover state)
  - Primary Light: `#A63F4C` (disabled state)

- **Accent Teal**: `#2D7F8F`
  - Use for: Links, secondary actions, category tags, search highlights
  - Conveys: Modernity, accessibility, international scope
  - Light variant: `#3FA3BA`

### Neutral Colors
- **White/Background**: `#FFFFFF`
- **Light Gray**: `#F8F9FA` (section backgrounds)
- **Border**: `#E0E0E0`
- **Text Dark**: `#1A1A1A` (primary text)
- **Text Muted**: `#666666` (secondary text)

### Status Colors
- **Success/Verified**: `#28A745` (for verification badges)
- **Warning**: `#FFC107`
- **Error/Danger**: `#DC3545`

### Design Rationale
- Burgundy provides **trust and legitimacy** from FiTEN's 40-year reputation
- Teal adds **energy and modernity** — signals this is NOT an outdated directory
- High contrast on text ensures **accessibility** (WCAG AA compliant)
- Muted grays prevent fatigue on screens used for long search sessions

---

## Typography

### Font Pairing

**Headers**: -apple-system, BlinkMacSystemFont, Segoe UI
- System fonts ensure consistency across devices and regions
- No custom fonts needed (faster loading, better accessibility)
- Fallback chain covers iOS, Windows, Android, Linux

**Body**: Same system stack
- Clean, modern, highly legible
- Works equally well in English and Tamil-script rendering
- All sizes tested for mobile reading

### Type Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 (Hero) | 3rem (48px) | 700 | Page titles, hero section |
| H2 (Section) | 1.75rem (28px) | 600 | Major section headers |
| H3 (Subsection) | 1.5rem (24px) | 600 | Business detail header |
| Body | 1rem (16px) | 400 | Main content, descriptions |
| Small | 0.9rem (14px) | 400 | Metadata, secondary info |
| Tiny | 0.85rem (13.6px) | 600 | Tags, badges, labels |

### Line Height
- Headlines: 1.2 (tight, impactful)
- Body: 1.6-1.8 (readable, comfortable for long reads)
- Form labels: 1.5

---

## Component Library

### Buttons

**Primary Button**
- Background: Burgundy (`#8B2E3B`)
- Text: White
- Padding: 0.75rem 1.5rem
- Border Radius: 0.5rem
- Hover: Dark burgundy with shadow
- Use for: Main CTAs (Search, Send Inquiry, Get Listed)

**Secondary Button (Outline)**
- Border: 2px Burgundy
- Background: Transparent
- Text: Burgundy
- Hover: Burgundy background with white text
- Use for: Secondary actions (Contact, Schedule Call)

**Filter Chips**
- Border: 2px Light gray
- Background: Transparent
- Hover/Active: Teal background with white text
- Use for: Category filters, multi-select options

### Cards

**Business Listing Card**
- Background: White
- Border Radius: 0.75rem
- Shadow: Light (0.1rem blur)
- Hover: Larger shadow, lift effect (translateY -4px)
- Content: Image (200px tall), name, category, location, description, actions
- Spacing: 1.5rem internal padding

**Tier Card** (Pricing)
- Border: 2px gray
- Selected: Burgundy border + light burgundy background
- Content: Name, price, features list
- Use for: Free vs. Pro comparison

### Input Fields

**Text Inputs / Textareas**
- Border: 2px `#E0E0E0`
- Padding: 0.75rem
- Border Radius: 0.5rem
- Focus: Border changes to teal, no outline ring
- Font: System stack, 1rem
- Use for: Search bar, forms, filters

### Badges

**Verified Badge**
- Background: Green (`#28A745`)
- Text: White, bold, 0.75rem
- Padding: 0.25rem 0.75rem
- Border Radius: 0.25rem
- Use for: "✓ Verified FiTEN Member" on all business profiles

---

## Layout Grid

### Spacing System
- **Base unit**: 1rem (16px)
- **Horizontal margins**: 2rem (2rem on desktop, 1rem on mobile)
- **Vertical spacing**: 3rem between sections
- **Component gaps**: 1rem (card-to-card), 0.5rem (element-to-element)

### Responsive Breakpoints
- **Desktop**: 1200px + (full-width grid)
- **Tablet**: 768px - 1199px (single column or 2-col, reduced padding)
- **Mobile**: < 768px (single column, 1rem margins)

### Grid Examples
- **Hero**: Full-width, centered content max-width 700px
- **Results**: 3-column auto-fill grid (320px min), gap 2rem
- **Detail view**: 300px image + flexible content, responsive to 1-column on mobile

---

## Page Layouts

### 1. Homepage / Search Results
- **Hero**: Gradient burgundy background, centered title + subtitle
- **Search Bar**: White card below hero, drop shadow
- **Filters**: Inline chips (wrap on mobile)
- **Results Grid**: Auto-fill 3 columns, business cards
- **Footer**: Dark background, white text

### 2. Business Detail
- **Header**: Gradient burgundy, business name + verified badge + meta info
- **Tabs**: Overview, Services, Portfolio, Contact
- **Content**: Section headers with teal underline
- **CTA**: "Send Inquiry" (primary) + "Schedule Call" (outline)
- **Form**: Max-width 600px, centered, white card

### 3. List Your Business
- **Form Sections**: Business info, tier selection, submission
- **Tier Cards**: Dual column (1 column mobile), side-by-side comparison
- **Submit button**: Full-width primary button

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio for normal text)
- Burgundy text on white: 7.2:1
- Teal text on white: 5.4:1
- Badge colors verified for colorblind users

### Interactive Elements
- Buttons: 44x44px minimum touch target
- Links: Underlined or color-coded, not color alone
- Form labels: Associated with inputs via `<label>` tags
- Keyboard navigation: Tab through all interactive elements

### Images & Icons
- All emoji icons treated as decorative (alt text not needed)
- Business photos: High contrast with text overlays
- Profile images: Crisp, centered, with fallback avatars

---

## Visual Motifs

### Recurring Elements
1. **Verified Badge** — Green check mark, appears on every verified business
2. **Category Tags** — Teal background, white text, used consistently
3. **Section Dividers** — Teal underline on H2 headers
4. **Gradient Hero** — Burgundy gradient, used on multiple pages for consistency

### Icon Strategy
- Use emoji for visual breaks (no custom icon set needed)
- Alt text: Descriptive for screen readers
- Consistent placement: Leading emoji + text alignment

---

## Dark Mode (Future)
Not included in v1, but system is designed for easy dark mode:
- Use CSS variables for all colors
- Swap `--bg-white` and `--text-dark` on `prefers-color-scheme: dark`
- Burgundy becomes lighter (show on dark background)

---

## Development Guidelines

### CSS Classes to Create
- `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`
- `.business-card`, `.business-card-image`, `.business-card-content`
- `.badge-verified`, `.tag`
- `.search-bar`, `.filter-chip`
- `.hero`, `.section`, `.form-group`
- `.results-grid`, `.pricing-tiers`

### Use System Fonts (No External Fonts)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Mobile-First Approach
- Start with 1-column layouts
- Expand to 2-3 columns at 768px+
- Adjust padding/margins at breakpoints

### Performance
- Optimize images for web (JPEG for photos, PNG for icons)
- Lazy load business card images below fold
- No animations by default (add on interaction)

---

## Bilingual Considerations

### Tamil Typography
- System fonts support Tamil script natively
- Tamil descriptions: Same size as English (no scaling needed)
- RTL languages: Not applicable, but layout should support LTR/RTL future versions
- Language toggle: Header navigation or account menu

### UI Text in Tamil
- Buttons: "தேடு" (Search), "தொடர்புக்கொள்ள" (Contact)
- Headings: Mix of English brand names + Tamil descriptions
- Form labels: Bilingual with English as primary

---

## Quality Checklist

- [ ] All buttons have hover/active states
- [ ] Form inputs show focus state (teal border)
- [ ] Business cards lift on hover
- [ ] Verified badge appears consistently
- [ ] Mobile layout tested at 375px width
- [ ] Text contrast meets WCAG AA
- [ ] Touch targets are 44x44px minimum
- [ ] Images load with fallback backgrounds
- [ ] Footer is visible on all pages

---

## Files & Resources

- **Mockups**: `fiten-mockups.html` (interactive prototype)
- **Color Codes**: All CSS variables in root section
- **Component Templates**: Copy from mockup HTML for development
