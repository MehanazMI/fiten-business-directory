'use client'

import { useState } from 'react'
import { postEvent } from '@/lib/firestore-rest'
import type { Event } from '@/types/event'

const EVENT_TYPES: Event['eventType'][] = ['webinar', 'meetup', 'conference', 'workshop', 'panel', 'networking', 'training', 'other']

export default function CreateEventForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [form, setForm] = useState<{
    title: string
    description: string
    eventType: Event['eventType']
    date: string
    startTime: string
    endTime: string
    location: 'virtual' | 'in-person'
    city: string
    address: string
    registrationLink: string
    capacity: string
    speakers: string
  }>({
    title: '',
    description: '',
    eventType: 'webinar',
    date: '',
    startTime: '',
    endTime: '',
    location: 'virtual',
    city: '',
    address: '',
    registrationLink: '',
    capacity: '',
    speakers: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = <K extends keyof typeof form>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value as any }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.startTime || !form.endTime) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const speakers = form.speakers
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)

      const eventData: Omit<Event, 'id' | 'status'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        eventType: form.eventType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location as 'virtual' | 'in-person',
        city: (form.location as string) === 'in-person' ? form.city.trim() || undefined : undefined,
        address: (form.location as string) === 'in-person' ? form.address.trim() || undefined : undefined,
        registrationLink: form.registrationLink.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        image: undefined,
        organizerId: businessId,
        organizerName: businessName,
        speakers: speakers.length > 0 ? speakers : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await postEvent(eventData)
      setSuccess(true)
      setForm({
        title: '',
        description: '',
        eventType: 'webinar',
        date: '',
        startTime: '',
        endTime: '',
        location: 'virtual',
        city: '',
        address: '',
        registrationLink: '',
        capacity: '',
        speakers: '',
      })
      setTimeout(() => window.location.href = '/events', 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <i className="ti ti-circle-check" />
        <h3>Event Created!</h3>
        <p>Redirecting to events page...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-section">
        <label className="form-label">
          Event Title *
          <input
            type="text"
            className="form-input"
            placeholder="Summer Networking Mixer"
            value={form.title}
            onChange={set('title')}
            required
          />
        </label>

        <label className="form-label">
          Description *
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Tell us about your event..."
            value={form.description}
            onChange={set('description')}
            required
          />
        </label>

        <label className="form-label">
          Event Type
          <select
            className="form-select"
            value={form.eventType}
            onChange={e => setForm(f => ({ ...f, eventType: e.target.value as Event['eventType'] }))}
          >
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-section">
        <h3>Date & Time</h3>
        <label className="form-label">
          Date *
          <input
            type="date"
            className="form-input"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
        </label>

        <div className="form-row">
          <label className="form-label">
            Start Time *
            <input
              type="time"
              className="form-input"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              required
            />
          </label>
          <label className="form-label">
            End Time *
            <input
              type="time"
              className="form-input"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              required
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Location</h3>
        <label className="form-label">
          <select
            className="form-select"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value as 'virtual' | 'in-person' }))}
          >
            <option value="virtual">Virtual</option>
            <option value="in-person">In-Person</option>
          </select>
        </label>

        {form.location === 'in-person' && (
          <>
            <label className="form-label">
              City
              <input
                type="text"
                className="form-input"
                placeholder="Toronto"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
            </label>
            <label className="form-label">
              Address
              <input
                type="text"
                className="form-input"
                placeholder="123 Main St, Suite 100"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </label>
          </>
        )}
      </div>

      <div className="form-section">
        <h3>Registration</h3>
        <label className="form-label">
          Registration Link
          <input
            type="url"
            className="form-input"
            placeholder="https://eventbrite.com/..."
            value={form.registrationLink}
            onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))}
          />
        </label>

        <label className="form-label">
          Capacity (optional)
          <input
            type="number"
            className="form-input"
            placeholder="100"
            min="1"
            value={form.capacity}
            onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
          />
        </label>
      </div>

      <div className="form-section">
        <h3>Speakers (optional)</h3>
        <label className="form-label">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Enter speaker names, one per line"
            value={form.speakers}
            onChange={e => setForm(f => ({ ...f, speakers: e.target.value }))}
          />
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="form-submit" disabled={submitting}>
        {submitting ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  )
}
