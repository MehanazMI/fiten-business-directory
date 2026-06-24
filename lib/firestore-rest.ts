import type { Business } from '@/types/business'
import type { Connection } from '@/types/connection'
import type { Event } from '@/types/event'
import { stableColorIdx, categoryMap } from '@/lib/utils'

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const EMULATOR = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST
const FS_BASE = EMULATOR
  ? `http://localhost:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  : `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
const keyParam = API_KEY ? `?key=${API_KEY}` : ''

interface FirestoreValue {
  stringValue?: string
  booleanValue?: boolean
  integerValue?: number | string
  doubleValue?: number
  timestampValue?: string
  arrayValue?: { values?: FirestoreValue[] }
}

interface FirestoreRestDoc {
  name: string
  fields: Record<string, FirestoreValue>
}

function parseFirestoreDoc(doc: FirestoreRestDoc): Business {
  const f = doc.fields
  const id = doc.name.split('/').pop()!
  const rawName = f.businessName?.stringValue ?? ''
  const colorIdx = stableColorIdx(id)

  return {
    id,
    businessName: rawName,
    nameTamil: f.nameTamil?.stringValue,
    category: categoryMap[f.category?.stringValue ?? ''] ?? f.category?.stringValue ?? 'Other',
    city: f.city?.stringValue ?? '',
    region: f.region?.stringValue ?? '',
    description: f.description?.stringValue ?? '',
    email: f.email?.stringValue ?? '',
    phone: f.phone?.stringValue,
    website: f.website?.stringValue,
    logoUrl: f.logoUrl?.stringValue,
    status: f.status?.stringValue ?? 'pending',
    pro: f.pro?.booleanValue ?? false,
    verified: f.verified?.booleanValue ?? false,
    verificationStatus: (f.verificationStatus?.stringValue as Business['verificationStatus']) ?? 'unverified',
    speaker: f.speaker?.booleanValue ?? false,
    women: f.women?.booleanValue ?? false,
    convention: f.convention?.booleanValue ?? false,
    looking: (f.looking?.arrayValue?.values ?? [])
      .map(v => v.stringValue as Business['looking'][number])
      .filter(Boolean),
    views: Number(f.views?.integerValue ?? 0),
    createdAt: f.createdAt?.timestampValue ?? '',
    services: (f.services?.arrayValue?.values ?? []).map(v => v.stringValue as string).filter(Boolean),
    linkedin: f.linkedin?.stringValue,
    twitter: f.twitter?.stringValue,
    employeeCount: f.employeeCount?.stringValue as Business['employeeCount'],
    updatedAt: f.updatedAt?.timestampValue ?? f.updatedAt?.stringValue,
    featured: f.featured?.booleanValue ?? false,
    initials: rawName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??',
    colorIdx,
  }
}

export async function fetchBusinesses(): Promise<Business[]> {
  const url = `${FS_BASE}/businesses${keyParam}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Firestore fetch failed: ${res.status}`)
  const data = await res.json()
  return (data.documents ?? [])
    .map(parseFirestoreDoc)
    .filter((b: Business) => b.status === 'active')
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  const url = `${FS_BASE}/businesses/${id}${keyParam}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return parseFirestoreDoc(await res.json())
}

export async function postConnection(conn: Omit<Connection, 'id'>): Promise<void> {
  const res = await fetch(`${FS_BASE}/connections${keyParam}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        fromName:       { stringValue: conn.fromName },
        fromEmail:      { stringValue: conn.fromEmail },
        ...(conn.fromBusiness ? { fromBusiness: { stringValue: conn.fromBusiness } } : {}),
        toBusinessId:   { stringValue: conn.toBusinessId },
        toBusinessName: { stringValue: conn.toBusinessName },
        type:           { stringValue: conn.type },
        message:        { stringValue: conn.message },
        status:         { stringValue: conn.status },
        createdAt:      { stringValue: conn.createdAt },
      },
    }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error?.message ?? `HTTP ${res.status}`)
  }
}

export async function incrementViews(businessId: string): Promise<void> {
  await fetch(`${FS_BASE}:commit${keyParam}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: `projects/${PROJECT_ID}/databases/(default)/documents/businesses/${businessId}`,
          fieldTransforms: [{ fieldPath: 'views', increment: { integerValue: '1' } }],
        },
      }],
    }),
  })
}

export interface Testimonial {
  quote: string
  author: string
  firm: string
  order: number
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const url = `${FS_BASE}/testimonials${keyParam}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()
  return ((data.documents ?? []) as FirestoreRestDoc[])
    .map(doc => {
      const f = doc.fields
      return {
        quote: f.quote?.stringValue ?? '',
        author: f.author?.stringValue ?? '',
        firm: f.firm?.stringValue ?? '',
        order: Number(f.order?.integerValue ?? 0),
      }
    })
    .filter(t => t.quote)
    .sort((a, b) => a.order - b.order)
}

function parseEventDoc(doc: FirestoreRestDoc): Event {
  const f = doc.fields
  const id = doc.name.split('/').pop()!
  return {
    id,
    title: f.title?.stringValue ?? '',
    description: f.description?.stringValue ?? '',
    eventType: (f.eventType?.stringValue as Event['eventType']) ?? 'other',
    date: f.date?.stringValue ?? '',
    startTime: f.startTime?.stringValue ?? '',
    endTime: f.endTime?.stringValue ?? '',
    location: (f.location?.stringValue as 'virtual' | 'in-person') ?? 'virtual',
    city: f.city?.stringValue,
    address: f.address?.stringValue,
    registrationLink: f.registrationLink?.stringValue,
    capacity: Number(f.capacity?.integerValue ?? 0) || undefined,
    image: f.image?.stringValue,
    organizerId: f.organizerId?.stringValue ?? '',
    organizerName: f.organizerName?.stringValue ?? '',
    speakers: (f.speakers?.arrayValue?.values ?? []).map(v => v.stringValue as string).filter(Boolean),
    region: f.region?.stringValue,
    status: (f.status?.stringValue as Event['status']) ?? 'upcoming',
    createdAt: f.createdAt?.timestampValue ?? '',
    updatedAt: f.updatedAt?.timestampValue ?? '',
  }
}

export async function fetchEvents(): Promise<Event[]> {
  const url = `${FS_BASE}/events${keyParam}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Firestore fetch failed: ${res.status}`)
  const data = await res.json()
  const events = (data.documents ?? []).map(parseEventDoc)
  const now = new Date()
  return events
    .map((e: Event) => ({
      ...e,
      status: (new Date(e.date + 'T00:00:00') < now ? 'past' : 'upcoming') as Event['status'],
    }))
    .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const url = `${FS_BASE}/events/${id}${keyParam}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null
  const event = parseEventDoc(await res.json())
  const now = new Date()
  return {
    ...event,
    status: new Date(event.date + 'T00:00:00') < now ? 'past' : 'upcoming' as const,
  }
}

export async function postEvent(event: Omit<Event, 'id' | 'status'>): Promise<string> {
  const res = await fetch(`${FS_BASE}/events${keyParam}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        title:            { stringValue: event.title },
        description:      { stringValue: event.description },
        eventType:        { stringValue: event.eventType },
        date:             { stringValue: event.date },
        startTime:        { stringValue: event.startTime },
        endTime:          { stringValue: event.endTime },
        location:         { stringValue: event.location },
        ...(event.city ? { city: { stringValue: event.city } } : {}),
        ...(event.address ? { address: { stringValue: event.address } } : {}),
        ...(event.registrationLink ? { registrationLink: { stringValue: event.registrationLink } } : {}),
        ...(event.capacity ? { capacity: { integerValue: String(event.capacity) } } : {}),
        ...(event.image ? { image: { stringValue: event.image } } : {}),
        organizerId:      { stringValue: event.organizerId },
        organizerName:    { stringValue: event.organizerName },
        ...(event.region ? { region: { stringValue: event.region } } : {}),
        ...(event.speakers?.length ? {
          speakers: {
            arrayValue: {
              values: event.speakers.map(s => ({ stringValue: s })),
            },
          },
        } : {}),
        status:           { stringValue: 'pending' },
        createdAt:        { stringValue: new Date().toISOString() },
        updatedAt:        { stringValue: new Date().toISOString() },
      },
    }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error?.message ?? `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.name?.split('/').pop() ?? ''
}
