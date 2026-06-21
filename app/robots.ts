import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Design artifacts in public/ — not for crawlers
      disallow: ['/mockup-', '/design-comparison.html'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
