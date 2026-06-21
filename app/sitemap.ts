import type { MetadataRoute } from 'next'
import { fetchBusinesses } from '@/lib/firestore-rest'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await fetchBusinesses()

  const businessPages: MetadataRoute.Sitemap = businesses.map(b => ({
    url: `${SITE_URL}/directory/${b.id}`,
    lastModified: b.createdAt ? new Date(b.createdAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: `${SITE_URL}/directory`,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/form`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...businessPages,
  ]
}
