'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Event } from '@/types/event'
import EventCard from './EventCard'

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'NYC Tech',    value: 'nyc' },
  { label: 'Conference',  value: 'conference' },
  { label: 'Networking',  value: 'networking' },
  { label: 'Webinar',     value: 'webinar' },
  { label: 'Workshop',    value: 'workshop' },
  { label: 'Virtual',     value: 'virtual' },
] as const

type Filter = typeof FILTERS[number]['value']

const VISIBLE_LIMIT = 4

export default function EventsClient({ events }: { events: Event[] }) {
  const [active, setActive] = useState<Filter>('all')
  const [showAll, setShowAll] = useState(false)

  const nycEvents    = useMemo(() => events.filter(e => e.region === 'nyc'), [events])
  const globalEvents = useMemo(() => events.filter(e => e.region !== 'nyc'), [events])

  const filtered = useMemo(() => {
    const pool = active === 'nyc' ? nycEvents : globalEvents
    if (active === 'all' || active === 'nyc') return pool
    if (active === 'virtual') return pool.filter(e => e.location === 'virtual')
    return pool.filter(e => e.eventType === active)
  }, [globalEvents, nycEvents, active])

  const upcoming = filtered.filter(e => e.status === 'upcoming')
  const past     = filtered.filter(e => e.status === 'past')

  const nycUpcoming = nycEvents.filter(e => e.status === 'upcoming')
  const nycPast     = nycEvents.filter(e => e.status === 'past')

  // Counts for filter chips (global pool only, not nyc)
  const counts = useMemo(() => ({
    all:         globalEvents.length,
    nyc:         nycEvents.length,
    conference:  globalEvents.filter(e => e.eventType === 'conference').length,
    networking:  globalEvents.filter(e => e.eventType === 'networking').length,
    webinar:     globalEvents.filter(e => e.eventType === 'webinar').length,
    workshop:    globalEvents.filter(e => e.eventType === 'workshop').length,
    virtual:     globalEvents.filter(e => e.location === 'virtual').length,
  }), [globalEvents, nycEvents])

  // Next up = first upcoming global event by date
  const nextUp = useMemo(() =>
    [...globalEvents]
      .filter(e => e.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date))[0],
    [globalEvents]
  )

  const totalUpcoming = globalEvents.filter(e => e.status === 'upcoming').length
  const totalPast     = globalEvents.filter(e => e.status === 'past').length

  const visibleUpcoming = showAll ? upcoming : upcoming.slice(0, VISIBLE_LIMIT)

  // Two sidebar "This Week" items
  const thisWeek = useMemo(() =>
    [...globalEvents]
      .filter(e => e.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 2),
    [globalEvents]
  )

  const recentPast = useMemo(() =>
    [...globalEvents]
      .filter(e => e.status === 'past')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3),
    [globalEvents]
  )

  function handleFilterChange(val: Filter) {
    setActive(val)
    setShowAll(false)
  }

  return (
    <div className="events-page">
      {/* ── Hero ── */}
      <div className="events-hero">
        <div className="events-hero-inner">
          <div className="events-hero-badge">
            <i className="ti ti-calendar-event" aria-hidden="true" style={{ color: 'var(--teal)', fontSize: '1rem' }} />
            Global Tamil Business Network
          </div>
          <h1>Community Events, <em>All in One Place</em></h1>
          <p className="events-hero-sub">
            Find your next opportunity. From NYC meetups to global summits, every Tamil business event in one place.
          </p>
          <div className="events-hero-stats">
            <div className="events-hero-stat-pill">
              <i className="ti ti-calendar-check" style={{ color: 'var(--teal)', fontSize: '1rem' }} aria-hidden="true" />
              <strong>{totalUpcoming}</strong><span>Upcoming</span>
            </div>
            <div className="events-hero-stat-pill">
              <i className="ti ti-history" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem' }} aria-hidden="true" />
              <strong style={{ color: 'rgba(255,255,255,0.45)' }}>{totalPast}</strong><span>Past</span>
            </div>
          </div>
        </div>

        {/* Next Up banner */}
        {nextUp && (() => {
          const d = new Date(nextUp.date + 'T00:00:00')
          const day = d.toLocaleDateString('en-US', { day: '2-digit' })
          const month = d.toLocaleDateString('en-US', { month: 'short' })
          return (
            <div className="events-next-up">
              <div className="events-next-up-left">
                <div className="events-next-up-date">
                  <span className="events-next-up-day">{day}</span>
                  <span className="events-next-up-month">{month}</span>
                </div>
                <div className="events-next-up-sep" />
                <div className="events-next-up-info">
                  <span className="events-next-up-eyebrow">
                    Next Up · {nextUp.eventType.charAt(0).toUpperCase() + nextUp.eventType.slice(1)}
                  </span>
                  <span className="events-next-up-title">{nextUp.title}</span>
                  <span className="events-next-up-meta">
                    {nextUp.startTime} – {nextUp.endTime} · {nextUp.location === 'virtual' ? 'Virtual' : nextUp.city || 'In Person'} · {nextUp.organizerName}
                  </span>
                </div>
              </div>
              <Link href={`/events/${nextUp.id}`} className="events-next-up-btn">
                <span>{nextUp.registrationLink ? 'Register →' : 'Details →'}</span>
              </Link>
            </div>
          )
        })()}
      </div>

      {/* ── Filters ── */}
      <div className="events-filters-bar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`events-filter-chip${active === f.value ? ' active' : ''}`}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
            <span className="events-chip-count">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="events-layout">

        {/* Main list */}
        <div className="events-main">
          {active === 'nyc' ? (
            <>
              {nycUpcoming.length > 0 && (
                <section className="events-section">
                  <h2 className="section-title">
                    <i className="ti ti-map-pin" aria-hidden="true" style={{ opacity: .6 }} />
                    NYC Tech — upcoming
                    <span className="section-title-count">{nycUpcoming.length}</span>
                  </h2>
                  <div className="events-upcoming-list">
                    {nycUpcoming.map(event => (
                      <EventCard key={event.id} event={event} variant="featured" />
                    ))}
                  </div>
                </section>
              )}
              {nycPast.length > 0 && (
                <section className="events-section">
                  <h2 className="section-title">
                    <i className="ti ti-map-pin" aria-hidden="true" style={{ opacity: .6 }} />
                    NYC Tech — past events
                    <span className="section-title-count">{nycPast.length}</span>
                  </h2>
                  <div className="events-past-grid">
                    {nycPast.map(event => (
                      <EventCard key={event.id} event={event} variant="compact" />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {upcoming.length > 0 ? (
                <>
                  <div className="events-section-heading">
                    <span className="events-section-title">Upcoming</span>
                    <span className="events-section-count">{upcoming.length} events</span>
                  </div>
                  {visibleUpcoming.map((event, i) => (
                    <EventCard key={event.id} event={event} variant="row" highlight={i === 0 && active === 'all'} />
                  ))}
                  {upcoming.length > VISIBLE_LIMIT && (
                    <div className="events-show-all">
                      <span className="events-show-all-label">
                        Showing {visibleUpcoming.length} of {upcoming.length} upcoming events
                      </span>
                      <button
                        className="events-show-all-link"
                        onClick={() => setShowAll(v => !v)}
                      >
                        {showAll ? 'Show less ↑' : `Show all ${upcoming.length} →`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="events-empty">
                  <i className="ti ti-calendar-off" aria-hidden="true" />
                  <p>{active === 'all' ? 'No upcoming events yet — be the first to post one!' : `No upcoming ${active} events.`}</p>
                  <Link href="/events/create" className="events-empty-cta">
                    <i className="ti ti-plus" aria-hidden="true" />
                    Post an Event
                  </Link>
                </div>
              )}

              {past.length > 0 && (
                <section className="events-section" style={{ marginTop: '2.5rem' }}>
                  <h2 className="section-title">
                    Past events
                    <span className="section-title-count">{past.length}</span>
                  </h2>
                  <div className="events-past-grid">
                    {past.map(event => (
                      <EventCard key={event.id} event={event} variant="compact" />
                    ))}
                  </div>
                </section>
              )}

              {active === 'all' && nycEvents.length > 0 && (
                <section className="events-section">
                  <h2 className="section-title events-nyc-title">
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    NYC Tech Events
                    <span className="section-title-count">{nycEvents.length}</span>
                    <button className="events-nyc-see-all" onClick={() => handleFilterChange('nyc')}>
                      See all <i className="ti ti-chevron-right" aria-hidden="true" />
                    </button>
                  </h2>
                  <div className="events-past-grid">
                    {[...nycEvents]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 3)
                      .map(event => (
                        <EventCard key={event.id} event={event} variant="compact" />
                      ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="events-sidebar">
          {/* This Week */}
          {thisWeek.length > 0 && (
            <div className="events-sidebar-section">
              <span className="events-sidebar-heading">This Week</span>
              <div className="events-this-week">
                {thisWeek.map((event, i) => {
                  const d = new Date(event.date + 'T00:00:00')
                  const day = d.toLocaleDateString('en-US', { day: '2-digit' })
                  const mon = d.toLocaleDateString('en-US', { month: 'short' })
                  const loc = event.location === 'virtual' ? 'Virtual' : event.city || 'In Person'
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="events-week-item" style={{ textDecoration: 'none' }}>
                      <div className={`events-week-date ${i === 0 ? 'events-week-date-primary' : 'events-week-date-secondary'}`}>
                        <span className="events-week-day">{day}</span>
                        <span className="events-week-mon">{mon}</span>
                      </div>
                      <div className="events-week-info">
                        <span className="events-week-title">{event.title}</span>
                        <span className="events-week-sub">{event.startTime} · {loc}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past events */}
          {recentPast.length > 0 && (
            <div className="events-sidebar-section">
              <span className="events-sidebar-heading">Past Events</span>
              <div className="events-past-list">
                {recentPast.map(event => {
                  const d = new Date(event.date + 'T00:00:00')
                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="events-past-item" style={{ textDecoration: 'none' }}>
                      <span className="events-past-title">{event.title}</span>
                      <span className="events-past-sub">{dateStr} · {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}</span>
                    </Link>
                  )
                })}
                <button className="events-past-view-all" onClick={() => {}}>View all past →</button>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="events-cta-block">
            <div className="events-cta-inner">
              <div className="events-cta-bar" />
              <div>
                <span className="events-cta-title">Host an event?</span>
                <span className="events-cta-sub">List it here for free and reach hundreds of Tamil business professionals.</span>
              </div>
            </div>
            <Link href="/events/create" className="events-cta-btn">
              <span>Post an Event</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
