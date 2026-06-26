import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sanitizeString, sanitizeUrl, isValidEmail } from '@/lib/sanitize'

const VALID_CATEGORIES = new Set([
  'Technology', 'Healthcare', 'Finance', 'Finance & Insurance', 'Education',
  'Retail', 'Real Estate', 'Food & Beverage', 'Professional Services',
  'Arts & Entertainment', 'Entertainment', 'Non-Profit', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Services', 'Other',
])
const VALID_LOOKING = ['partner', 'client', 'invest', 'hire']

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // --- Validate required fields ---
  const businessName = sanitizeString(body.businessName)
  const category     = sanitizeString(body.category)
  const email        = sanitizeString(body.email)
  const phone        = sanitizeString(body.phone)
  const city         = sanitizeString(body.city)
  const description  = sanitizeString(body.description)

  if (!businessName || !category || !email || !phone || !city || !description) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 })
  }
  if (businessName.length > 120) {
    return NextResponse.json({ error: 'businessName_too_long' }, { status: 400 })
  }
  if (description.length > 1000) {
    return NextResponse.json({ error: 'description_too_long' }, { status: 400 })
  }

  // --- Optional fields ---
  const nameTamil  = sanitizeString(body.nameTamil)
  const region     = sanitizeString(body.region)
  const website    = sanitizeUrl(body.website)
  const logoUrl    = sanitizeUrl(body.logoUrl)
  const looking    = Array.isArray(body.looking)
    ? (body.looking as unknown[]).filter(v => VALID_LOOKING.includes(v as string)) as string[]
    : []
  const women      = body.women === true
  const speaker    = body.speaker === true
  const convention = body.convention === true

  // --- Duplicate check ---
  const existing = await adminDb
    .collection('businesses')
    .where('email', '==', email)
    .where('status', 'in', ['active', 'pending'])
    .limit(1)
    .get()

  if (!existing.empty) {
    return NextResponse.json({ error: 'business_exists' }, { status: 409 })
  }

  // --- Write to Firestore ---
  const doc = {
    businessName,
    ...(nameTamil && { nameTamil }),
    category,
    city,
    ...(region && { region }),
    description,
    email,
    phone,
    ...(website && { website }),
    ...(logoUrl && { logoUrl }),
    looking,
    women,
    speaker,
    convention,
    status: 'pending',
    pro: false,
    rating: 0,
    reviews: 0,
    views: 0,
    createdAt: new Date().toISOString(),
  }

  try {
    const ref = await adminDb.collection('businesses').add(doc)
    return NextResponse.json({ success: true, id: ref.id })
  } catch (err) {
    console.error('Firestore write failed:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
