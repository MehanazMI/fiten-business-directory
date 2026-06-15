import type { Business } from '@/types/business'
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
    rating: f.rating?.doubleValue ?? Number(f.rating?.integerValue ?? 0),
    reviews: Number(f.reviews?.integerValue ?? 0),
    views: Number(f.views?.integerValue ?? 0),
    createdAt: f.createdAt?.timestampValue ?? '',
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
