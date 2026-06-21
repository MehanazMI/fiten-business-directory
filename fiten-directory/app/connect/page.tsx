import { fetchBusinesses } from '@/lib/firestore-rest'
import ConnectClient from './ConnectClient'
import SiteHeader from '@/app/components/SiteHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Connect — FiTEN Business Directory' },
  description: 'Find Tamil businesses open to partnerships, investment, clients, and hiring. Build your network with the global Tamil business community.',
  alternates: { canonical: '/connect' },
}

export default async function ConnectPage() {
  const businesses = await fetchBusinesses()
  return (
    <>
      <SiteHeader activeLink="connect" />
      <main>
        <ConnectClient businesses={businesses} />
      </main>
    </>
  )
}
