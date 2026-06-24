import { fetchEvents } from '@/lib/firestore-rest'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import EventsClient from './EventsClient'

export const revalidate = 300

export default async function EventsPage() {
  const events = await fetchEvents()

  return (
    <>
      <SiteHeader activeLink={'events'} />
      <EventsClient events={events} />
      <SiteFooter />
    </>
  )
}
