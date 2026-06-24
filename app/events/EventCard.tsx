import Link from 'next/link'
import type { Event } from '@/types/event'

const TYPE_COLORS: Record<Event['eventType'], string> = {
  webinar:    '#0066cc',
  meetup:     '#ff6b35',
  conference: '#004e89',
  workshop:   '#1abc9c',
  panel:      '#e74c3c',
  networking: '#27ae60',
  training:   '#8e44ad',
  other:      '#95a5a6',
}

const TYPE_ICONS: Record<Event['eventType'], string> = {
  webinar:    'ti-video',
  meetup:     'ti-users',
  conference: 'ti-building-community',
  workshop:   'ti-tool',
  panel:      'ti-users-group',
  networking: 'ti-network',
  training:   'ti-school',
  other:      'ti-calendar',
}

const TYPE_LABELS: Record<Event['eventType'], string> = {
  webinar:    'Webinar',
  meetup:     'Meetup',
  conference: 'Conference',
  workshop:   'Workshop',
  panel:      'Panel',
  networking: 'Networking',
  training:   'Training',
  other:      'Event',
}

interface Props {
  event: Event
  variant?: 'featured' | 'compact' | 'default' | 'row'
  highlight?: boolean
}

export default function EventCard({ event, variant = 'default', highlight }: Props) {
  const eventDate = new Date(event.date + 'T00:00:00')
  const isUpcoming = event.status === 'upcoming'
  const color = TYPE_COLORS[event.eventType]
  const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const locationStr = event.location === 'virtual'
    ? 'Virtual'
    : event.city || event.address || 'Location TBA'

  if (variant === 'row') {
    const day = eventDate.toLocaleDateString('en-US', { day: '2-digit' })
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
    return (
      <Link
        href={`/events/${event.id}`}
        className={`event-row${highlight ? ' event-row-highlight' : ''}`}
      >
        <div className="event-row-accent" style={{ background: color }} />
        <div className="event-row-date">
          <span className="event-row-day">{day}</span>
          <span className="event-row-month">{month}</span>
        </div>
        <div className="event-row-body">
          <div className="event-row-top">
            <span
              className="event-row-badge"
              style={{ background: color + '18', color }}
            >
              {TYPE_LABELS[event.eventType]}
            </span>
            <span className={isUpcoming ? 'event-row-status-up' : 'event-row-status-past'}>
              {isUpcoming ? '● Upcoming' : 'Past'}
            </span>
          </div>
          <span className="event-row-title">{event.title}</span>
          <div className="event-row-meta">
            <span className="event-row-meta-item">{event.startTime} – {event.endTime}</span>
            <span className="event-row-meta-dot" />
            <span className="event-row-meta-item">{locationStr}</span>
            <span className="event-row-meta-dot" />
            <span className="event-row-meta-org">{event.organizerName}</span>
          </div>
        </div>
        <div className="event-row-action">
          <span className="event-row-link">
            {event.registrationLink ? 'Register →' : 'Details →'}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.id}`} className="event-compact-card">
        <div className="event-compact-badge" style={{ background: color + '18', color }}>
          <i className={`ti ${TYPE_ICONS[event.eventType]}`} aria-hidden="true" />
          {TYPE_LABELS[event.eventType]}
        </div>
        <div className="event-compact-title">{event.title}</div>
        <div className="event-compact-meta">
          <i className="ti ti-calendar" aria-hidden="true" />
          {dateStr}
        </div>
        <div className="event-compact-meta">
          <i className={`ti ${event.location === 'virtual' ? 'ti-world-www' : 'ti-map-pin'}`} aria-hidden="true" />
          {locationStr}
        </div>
        <div className="event-compact-footer">
          <span className="event-compact-org">{event.organizerName}</span>
          <span className="event-compact-cta">Details <i className="ti ti-chevron-right" aria-hidden="true" /></span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/events/${event.id}`} className={`event-card${variant === 'featured' ? ' event-card-featured' : ''}`}>
      <div className="event-card-accent" style={{ background: color }} />
      <div className="event-card-body">
        <div className="event-card-top">
          <span className="event-type-badge" style={{ background: color + '18', color }}>
            <i className={`ti ${TYPE_ICONS[event.eventType]}`} aria-hidden="true" />
            {TYPE_LABELS[event.eventType]}
          </span>
          <span className={`event-status ${isUpcoming ? 'upcoming' : 'past'}`}>
            {isUpcoming ? '● Upcoming' : 'Past'}
          </span>
        </div>
        <h3 className="event-title">{event.title}</h3>
        <hr className="event-divider" />
        <div className="event-meta">
          <div className="event-meta-row">
            <i className="ti ti-calendar" aria-hidden="true" />
            <span>{dateStr}</span>
          </div>
          <div className="event-meta-row">
            <i className="ti ti-clock" aria-hidden="true" />
            <span>{event.startTime} – {event.endTime}</span>
          </div>
          <div className="event-meta-row">
            <i className={`ti ${event.location === 'virtual' ? 'ti-world-www' : 'ti-map-pin'}`} aria-hidden="true" />
            <span>{locationStr}</span>
          </div>
          <div className="event-meta-row">
            <i className="ti ti-building" aria-hidden="true" />
            <span className="event-organizer">{event.organizerName}</span>
          </div>
        </div>
        <p className="event-description">{event.description}</p>
        <div className="event-cta">
          <span className="event-link-btn">
            {event.registrationLink ? 'Register / Learn More' : 'View Details'}
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
