// Canonical site origin. At domain cutover, set NEXT_PUBLIC_SITE_URL=https://fiten.org
// in Vercel project env vars and redeploy — every canonical URL, OG tag, robots.txt,
// and sitemap entry switches with it. No trailing slash.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fiten-directory.vercel.app'
