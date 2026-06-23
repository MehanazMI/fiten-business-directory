import { fetchEvents } from '@/lib/firestore-rest'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import EventCard from './EventCard'

export const revalidate = 300

export default async function EventsPage() {
  const events = await fetchEvents()
  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  const pastEvents = events.filter(e => e.status === 'past')

  return (
    <>
      <SiteHeader activeLink={'events'} />
      <div className="events-page">
        <div className="events-header">
          <h1>Community Events</h1>
          <p>Find networking events, webinars, conferences, and workshops in our community</p>
        </div>

        <div className="events-container">
          {upcomingEvents.length > 0 ? (
            <>
              <section className="events-section">
                <h2 className="section-title">Upcoming Events</h2>
                <div className="events-grid">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="events-empty">
              <i className="ti ti-calendar-off" aria-hidden="true" />
              <p>No upcoming events yet</p>
            </div>
          )}

          {pastEvents.length > 0 && (
            <section className="events-section">
              <h2 className="section-title">Past Events</h2>
              <div className="events-grid">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
