import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchEvents, fetchEventById } from '@/lib/firestore-rest'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export const revalidate = 300

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar: '#0066cc',
  meetup: '#ff6b35',
  conference: '#004e89',
  workshop: '#1abc9c',
  panel: '#e74c3c',
  networking: '#27ae60',
  training: '#8e44ad',
  other: '#95a5a6',
}

export async function generateStaticParams() {
  const events = await fetchEvents()
  return events.map(e => ({ id: e.id }))
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await fetchEventById(id)
  if (!event) notFound()

  const eventDate = new Date(event.date + 'T00:00:00')
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const dateShort = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <>
      <SiteHeader activeLink={'events'} />
      <div className="event-detail-page">
        <Link href="/events" className="event-detail-back">
          <i className="ti ti-arrow-left" aria-hidden="true" /> Back to Events
        </Link>

        <article className="event-detail-card">
          {event.image && (
            <div className="event-detail-image">
              <img src={event.image} alt={event.title} />
            </div>
          )}

          <div className="event-detail-header">
            <div className="event-detail-meta-top">
              <span className="event-type-badge" style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}>
                {event.eventType}
              </span>
              <span className={`event-status ${event.status}`}>
                {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
              </span>
            </div>
            <h1 className="event-detail-title">{event.title}</h1>
            <p className="event-detail-organizer">
              Hosted by <strong>{event.organizerName}</strong>
            </p>
          </div>

          <div className="event-detail-body">
            <div className="event-detail-grid">
              <div className="event-detail-main">
                <section className="event-detail-sec">
                  <h2>About This Event</h2>
                  <p className="event-detail-desc">{event.description}</p>
                </section>

                {event.speakers && event.speakers.length > 0 && (
                  <section className="event-detail-sec">
                    <h2>Speakers</h2>
                    <ul className="event-speakers">
                      {event.speakers.map((speaker, i) => (
                        <li key={i}>{speaker}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <aside className="event-detail-sidebar">
                <div className="event-detail-card-box">
                  <div className="event-detail-info">
                    <div className="event-detail-info-item">
                      <i className="ti ti-calendar" aria-hidden="true" />
                      <div>
                        <div className="info-label">Date</div>
                        <div className="info-value">{dateStr}</div>
                      </div>
                    </div>

                    <div className="event-detail-info-item">
                      <i className="ti ti-clock" aria-hidden="true" />
                      <div>
                        <div className="info-label">Time</div>
                        <div className="info-value">{event.startTime} – {event.endTime}</div>
                      </div>
                    </div>

                    <div className="event-detail-info-item">
                      <i className={`ti ${event.location === 'virtual' ? 'ti-world-www' : 'ti-map-pin'}`} aria-hidden="true" />
                      <div>
                        <div className="info-label">Location</div>
                        <div className="info-value">
                          {event.location === 'virtual'
                            ? 'Virtual Event'
                            : event.city || event.address || 'Location TBA'}
                        </div>
                      </div>
                    </div>

                    {event.capacity && (
                      <div className="event-detail-info-item">
                        <i className="ti ti-users" aria-hidden="true" />
                        <div>
                          <div className="info-label">Capacity</div>
                          <div className="info-value">{event.capacity} attendees</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {event.registrationLink && (
                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="event-register-btn">
                      <i className="ti ti-external-link" aria-hidden="true" />
                      Register / Learn More
                    </a>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </article>
      </div>
      <SiteFooter />
    </>
  )
}
