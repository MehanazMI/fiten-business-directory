import type { MetadataRoute } from 'next'
import { fetchBusinesses } from '@/lib/firestore-rest'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await fetchBusinesses()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/directory`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/form`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const listingRoutes: MetadataRoute.Sitemap = businesses
    .filter(b => b.status === 'active')
    .map(b => ({
      url: `${SITE_URL}/directory/${b.id}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : b.createdAt ? new Date(b.createdAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: b.pro ? 0.9 : 0.7,
    }))

  return [...staticRoutes, ...listingRoutes]
}
