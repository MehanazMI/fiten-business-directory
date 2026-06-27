import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sanitizeString, sanitizeUrl, isValidEmail } from '@/lib/sanitize'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'
import { isBusinessEmail, domainsMatch } from '@/lib/domain-utils'
import { randomBytes } from 'crypto'

const VALID_CATEGORIES = new Set([
  'Technology', 'Healthcare', 'Finance', 'Finance & Insurance', 'Education',
  'Retail', 'Real Estate', 'Food & Beverage', 'Professional Services',
  'Arts & Entertainment', 'Entertainment', 'Non-Profit', 'Legal', 'Marketing',
  'Logistics', 'Human Resources', 'Agriculture', 'Services', 'Other',
])
const VALID_LOOKING = ['partner', 'client', 'invest', 'hire', 'mentor']

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getIp(req), { limit: 5, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // --- Required fields ---
  const businessName = sanitizeString(body.businessName)
  const category     = sanitizeString(body.category)
  const email        = sanitizeString(body.email)
  const city         = sanitizeString(body.city)
  const description  = sanitizeString(body.description)

  if (!businessName || !category || !email || !city || !description) {
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
  const phone         = sanitizeString(body.phone)
  const nameTamil     = sanitizeString(body.nameTamil)
  const region        = sanitizeString(body.region)
  const country       = sanitizeString(body.country)
  const address       = sanitizeString(body.address)
  const timezone      = sanitizeString(body.timezone)
  const businessHours = sanitizeString(body.businessHours)
  const website       = sanitizeUrl(body.website)
  const logoUrl       = sanitizeUrl(body.logoUrl)
  const looking     = Array.isArray(body.looking)
    ? (body.looking as unknown[]).filter(v => VALID_LOOKING.includes(v as string)) as string[]
    : []
  const women       = body.women === true
  const speaker     = body.speaker === true
  const nonprofit   = body.nonprofit === true
  const convention  = body.convention === true

  // --- Google auth linkage ---
  const submittedByUid   = typeof body.submittedByUid === 'string' ? body.submittedByUid : null
  const submittedByEmail = typeof body.submittedByEmail === 'string' ? body.submittedByEmail : null

  // --- Domain trust signals ---
  const businessEmailFlag = isBusinessEmail(email)
  const domainMatchFlag   = businessEmailFlag && domainsMatch(email, website ?? '')

  // --- Duplicate check (skipped for demo email to allow repeated test submissions) ---
  const demoEmail = process.env.DEMO_EMAIL
  const isDemoSubmission = demoEmail && email === demoEmail
  if (!isDemoSubmission) {
    const existing = await adminDb
      .collection('businesses')
      .where('email', '==', email)
      .where('status', 'in', ['active', 'pending'])
      .limit(1)
      .get()
    if (!existing.empty) {
      return NextResponse.json({ error: 'business_exists' }, { status: 409 })
    }
  }

  // --- Verification token (48h expiry) ---
  const verificationToken  = randomBytes(32).toString('hex')
  const verificationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  // --- Write to Firestore ---
  const doc: Record<string, unknown> = {
    businessName,
    ...(nameTamil && { nameTamil }),
    category,
    city,
    ...(region && { region }),
    ...(country && { country }),
    ...(address && { address }),
    ...(timezone && { timezone }),
    ...(businessHours && { businessHours }),
    description,
    email,
    ...(phone && { phone }),
    ...(website && { website }),
    ...(logoUrl && { logoUrl }),
    looking,
    women,
    speaker,
    nonprofit,
    convention,
    status: 'pending',
    pro: false,
    rating: 0,
    reviews: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    consentGiven: body.consentGiven === true,
    consentAt: typeof body.consentAt === 'string' ? body.consentAt : new Date().toISOString(),
    // Verification
    emailVerified: false,
    verificationToken,
    verificationExpiry,
    // Domain trust
    businessEmail: businessEmailFlag,
    domainMatch: domainMatchFlag,
    // Google auth
    ...(submittedByUid && { submittedBy: { uid: submittedByUid, email: submittedByEmail } }),
  }

  let ref: FirebaseFirestore.DocumentReference
  try {
    ref = await adminDb.collection('businesses').add(doc)
  } catch (err) {
    console.error('Firestore write failed:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // --- Send verification email (awaited so it completes before serverless fn terminates) ---
  try {
    await sendVerificationEmail(email, businessName, verificationToken)
  } catch (err) {
    console.error('Verification email failed:', err)
  }

  return NextResponse.json({ success: true, id: ref.id })
}
