/**
 * Seeds the local Firestore emulator with test businesses.
 * Run: node scripts/seed-emulator.mjs
 * Requires the emulator to be running: firebase emulators:start --only firestore
 */

const EMULATOR_URL = 'http://localhost:8080/v1/projects/fiten-business-directory/databases/(default)/documents/businesses'

const businesses = [
  {
    businessName: '[TEST] TamilMed Clinics',
    category: 'Healthcare',
    city: 'Edison, NJ',
    region: 'North America',
    description: 'Tamil-speaking family medicine practice offering bilingual care to the South Asian community.',
    email: 'info@tamilmedclinics.com',
    phone: '+1-732-000-0002',
    website: 'tamilmedclinics.com',
    status: 'active',
    pro: true,
    looking: ['client', 'partner'],
    women: true,
    speaker: false,
    convention: false,
    rating: 4.8,
    reviews: 87,
    views: 489,
  },
  {
    businessName: '[TEST] ERP Logic Inc.',
    category: 'Technology',
    city: 'Dallas, TX',
    region: 'North America',
    description: 'Enterprise resource planning consulting specializing in SAP implementations for mid-market companies.',
    email: 'info@erplogic.com',
    phone: '+1-214-000-0005',
    website: '',
    status: 'active',
    pro: true,
    looking: ['partner', 'client', 'hire'],
    women: false,
    speaker: true,
    convention: false,
    rating: 4.6,
    reviews: 56,
    views: 198,
  },
  {
    businessName: '[TEST] Vani Language Academy',
    category: 'Education',
    city: 'Coimbatore, India',
    region: 'South Asia',
    description: 'Tamil language and Carnatic music classes for children and adults across the diaspora.',
    email: 'info@vaniacademy.com',
    phone: '+91-422-000-0008',
    website: '',
    status: 'active',
    pro: false,
    looking: ['partner', 'client'],
    women: true,
    speaker: false,
    convention: false,
    rating: 4.8,
    reviews: 134,
    views: 0,
  },
  {
    businessName: '[TEST] Tamil Legal Group',
    category: 'Legal',
    city: 'Houston, TX',
    region: 'North America',
    description: 'Immigration, family law and business formation services for the Tamil-speaking community.',
    email: 'info@tamillegal.com',
    phone: '+1-713-000-0007',
    website: '',
    status: 'active',
    pro: false,
    looking: ['client', 'partner'],
    women: false,
    speaker: false,
    convention: false,
    rating: 4.7,
    reviews: 95,
    views: 0,
  },
  {
    businessName: '[TEST] Jaffna Bakery',
    category: 'Food & Beverage',
    city: 'San Jose, CA',
    region: 'North America',
    description: 'Traditional Jaffna-style baked goods, sweets, and savouries. Murukku, kokis, and fresh-baked bread delivered across the Bay Area.',
    email: 'hello@jaffnabakery.com',
    phone: '+1-408-555-0123',
    website: '',
    status: 'active',
    pro: false,
    looking: [],
    women: false,
    speaker: false,
    convention: false,
    rating: 0,
    reviews: 0,
    views: 0,
  },
  {
    businessName: '[TEST] Pending Business',
    category: 'Services',
    city: 'Toronto, ON',
    region: 'Greater Toronto Area',
    description: 'This listing is pending approval and should NOT appear in the directory.',
    email: 'pending@example.com',
    phone: '',
    website: '',
    status: 'pending',
    pro: false,
    looking: [],
    women: false,
    speaker: false,
    convention: false,
    rating: 0,
    reviews: 0,
    views: 0,
  },
]

function toFirestoreFields(obj) {
  const fields = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value }
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value)
        ? { integerValue: String(value) }
        : { doubleValue: value }
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ stringValue: v })),
        },
      }
    }
  }
  fields.createdAt = { timestampValue: new Date().toISOString() }
  return { fields }
}

async function seed() {
  console.log(`Seeding ${businesses.length} businesses into emulator...`)
  let ok = 0
  let fail = 0

  for (const biz of businesses) {
    try {
      const res = await fetch(EMULATOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreFields(biz)),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message ?? `HTTP ${res.status}`)
      }
      console.log(`  ✓ ${biz.businessName}`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${biz.businessName}: ${err.message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} added, ${fail} failed.`)
  console.log('Emulator UI: http://localhost:4000')
}

seed()
