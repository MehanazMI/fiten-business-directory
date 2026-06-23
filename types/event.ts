export interface Event {
  id: string
  title: string
  description: string
  eventType: 'webinar' | 'meetup' | 'conference' | 'workshop' | 'panel' | 'networking' | 'training' | 'other'
  date: string // ISO date (YYYY-MM-DD)
  startTime: string // HH:mm
  endTime: string // HH:mm
  location: 'virtual' | 'in-person'
  city?: string
  address?: string
  registrationLink?: string
  capacity?: number
  image?: string
  organizerId: string // businessId who posted the event
  organizerName: string // business name (denormalized for display)
  speakers?: string[] // speaker names or descriptions
  status: 'upcoming' | 'live' | 'past'
  createdAt: string
  updatedAt: string
}
