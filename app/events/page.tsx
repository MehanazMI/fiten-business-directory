import Link from 'next/link'
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
        <div className="events-hero">
          <h1>Community Events</h1>
          <p>Networking events, webinars, conferences, and workshops from across the Tamil business community</p>
          <div className="events-hero-actions">
            <Link href="/events/create" className="events-post-btn">
              <i className="ti ti-plus" aria-hidden="true" />
              Post an Event
            </Link>
            {(upcomingEvents.length + pastEvents.length) > 0 && (
              <span className="events-count-badge">
                {upcomingEvents.length} upcoming · {pastEvents.length} past
              </span>
            )}
          </div>
        </div>

        <div className="events-container">
          {upcomingEvents.length > 0 ? (
            <section className="events-section">
              <h2 className="section-title">
                Upcoming Events
                <span className="section-title-count">{upcomingEvents.length}</span>
              </h2>
              <div className="events-grid">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ) : (
            <div className="events-empty">
              <i className="ti ti-calendar-off" aria-hidden="true" />
              <p>No upcoming events yet — be the first to post one!</p>
              <Link href="/events/create" className="events-empty-cta">
                <i className="ti ti-plus" aria-hidden="true" />
                Post an Event
              </Link>
            </div>
          )}

          {pastEvents.length > 0 && (
            <section className="events-section">
              <h2 className="section-title">
                Past Events
                <span className="section-title-count">{pastEvents.length}</span>
              </h2>
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
