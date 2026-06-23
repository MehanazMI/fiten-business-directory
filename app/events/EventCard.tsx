import Link from 'next/link'
import type { Event } from '@/types/event'

const EVENT_TYPE_COLORS: Record<Event['eventType'], string> = {
  webinar: '#0066cc',
  meetup: '#ff6b35',
  conference: '#004e89',
  workshop: '#1abc9c',
  panel: '#e74c3c',
  networking: '#27ae60',
  training: '#8e44ad',
  other: '#95a5a6',
}

const EVENT_TYPE_ICONS: Record<Event['eventType'], string> = {
  webinar: 'ti-video',
  meetup: 'ti-users',
  conference: 'ti-building-community',
  workshop: 'ti-tool',
  panel: 'ti-users-group',
  networking: 'ti-network',
  training: 'ti-school',
  other: 'ti-calendar',
}

export default function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date)
  const isUpcoming = event.status === 'upcoming'
  const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = `${event.startTime} – ${event.endTime}`

  return (
    <Link href={`/events/${event.id}`}>
      <div className="event-card">
        {event.image && <img src={event.image} alt={event.title} className="event-image" />}

        <div className="event-header">
          <div className="event-type-badge" style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}>
            <i className={`ti ${EVENT_TYPE_ICONS[event.eventType]}`} aria-hidden="true" />
            <span>{event.eventType}</span>
          </div>
          <span className={`event-status ${isUpcoming ? 'upcoming' : 'past'}`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>

        <h3 className="event-title">{event.title}</h3>

        <div className="event-meta">
          <div className="event-meta-row">
            <i className="ti ti-calendar" aria-hidden="true" />
            <span>{dateStr}</span>
          </div>
          <div className="event-meta-row">
            <i className="ti ti-clock" aria-hidden="true" />
            <span>{timeStr}</span>
          </div>
          <div className="event-meta-row">
            <i className={`ti ${event.location === 'virtual' ? 'ti-world-www' : 'ti-map-pin'}`} aria-hidden="true" />
            <span>{event.location === 'virtual' ? 'Virtual' : event.city || event.address || 'Location TBA'}</span>
          </div>
          <div className="event-meta-row">
            <i className="ti ti-building" aria-hidden="true" />
            <span className="event-organizer">{event.organizerName}</span>
          </div>
        </div>

        <p className="event-description">{event.description.slice(0, 150)}...</p>

        {event.registrationLink && (
          <div className="event-cta">
            <span className="event-link-btn">Register →</span>
          </div>
        )}
      </div>
    </Link>
  )
}
