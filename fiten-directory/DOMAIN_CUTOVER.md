# Domain Cutover Checklist — fiten.org

How to move the directory from `fiten-directory.vercel.app` to the production domain.
Everything in the codebase is already domain-aware: canonical URLs, Open Graph tags,
`robots.txt`, and `sitemap.xml` all derive from one env var.

---

## Pre-cutover (already done in code)

- [x] `lib/site.ts` — single source of truth for the site origin (`NEXT_PUBLIC_SITE_URL`, falls back to the vercel.app domain)
- [x] `metadataBase` + default Open Graph / Twitter metadata in `app/layout.tsx`
- [x] Canonical URLs on `/directory`, `/form`, and `/directory/[id]`
- [x] `app/robots.ts` → serves `/robots.txt` (blocks design mockup HTML files)
- [x] `app/sitemap.ts` → serves `/sitemap.xml` with all active businesses
- [x] LocalBusiness JSON-LD structured data on business detail pages
- [x] Redirects for legacy URLs: `/index.html` → `/directory`, `/form.html` → `/form`

## Cutover day

1. **Add the domain in Vercel**
   Dashboard → project `fiten-directory` → Settings → Domains → add `fiten.org`
   (and `www.fiten.org`, set to redirect to the apex).
   CLI alternative: `npx vercel domains add fiten.org`

2. **Update DNS at the registrar**
   - Apex `fiten.org`: `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
   - Vercel shows the exact records it wants on the Domains page — follow those if they differ.
   - Keep TTL low (300s) the first day so mistakes are quick to fix.

3. **Set the canonical origin env var**
   Vercel → Settings → Environment Variables → add to **Production**:
   ```
   NEXT_PUBLIC_SITE_URL=https://fiten.org
   ```
   Then redeploy (env vars only apply to new builds). This flips every canonical
   URL, OG tag, robots sitemap pointer, and sitemap entry to the new domain.

4. **Verify** (after DNS propagates — minutes to a few hours)
   - `https://fiten.org` → redirects to `/directory`, page loads with data
   - `https://fiten.org/robots.txt` → references `https://fiten.org/sitemap.xml`
   - `https://fiten.org/sitemap.xml` → lists `/directory`, `/form`, and business pages on the new domain
   - View source on a business page → `<link rel="canonical">` and JSON-LD use `fiten.org`
   - `https://fiten.org/form.html` → 308 redirect to `/form`
   - HTTPS certificate issued automatically by Vercel (check the padlock)

## Post-cutover

5. **Google Search Console**
   - Add property for `fiten.org` (domain property, verify via DNS TXT record)
   - Submit `https://fiten.org/sitemap.xml`

6. **Old vercel.app domain**
   Vercel automatically 308-redirects `fiten-directory.vercel.app` to the primary
   domain once `fiten.org` is set as primary — confirm in Settings → Domains.

7. **Update outward links**
   - FiTEN/FeTNA announcement posts, WhatsApp groups, email signatures
   - `IMPLEMENTATION_PLAN.md` risk register: mark "Domain not connected" resolved
   - GitHub repo description / README links

8. **Legacy static site** (repo root `index.html` / `form.html`)
   Reference only — it is not deployed anywhere once the Vercel project's root
   directory points at `fiten-directory/`. Safe to archive after cutover.
