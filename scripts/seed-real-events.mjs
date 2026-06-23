// One-time script to seed real Tamil business network events into production Firestore
const PROJECT_ID = 'fiten-business-directory'
const API_KEY = 'AIzaSyAtvJuRVFrbQb4kYrykjeu4YZKzyhqUKnU'
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

const events = [
  // ── UPCOMING ──────────────────────────────────────────────────────────────
  {
    title: 'FeTNA 39th Annual Tamil Convention 2026',
    description: "North America's largest Tamil gathering returns to New Jersey. Features the FiTEN Business Summit connecting Tamil entrepreneurs, investors, and innovators across the global diaspora, alongside cultural performances, youth leadership forums, literary discussions, and community recognition programs.",
    eventType: 'conference',
    date: '2026-07-02',
    startTime: '09:00',
    endTime: '22:00',
    location: 'in-person',
    city: 'Edison, NJ',
    address: 'New Jersey Convention and Exposition Center, 97 Sunfield Ave, Edison, NJ 08837',
    registrationLink: 'https://register.fetna-convention.org/',
    organizerId: 'fetna-org',
    organizerName: 'FeTNA – Federation of Tamil Sangams of North America',
    speakers: [],
  },

  // ── PAST ──────────────────────────────────────────────────────────────────
  {
    title: 'RISE 16th Global Summit of Tamil Entrepreneurs & Professionals',
    description: "The RISE 16th Global Summit brought together Tamil entrepreneurs and professionals from around the world in Madurai. Over 100 sessions including hands-on workshops and keynote speeches covering Corporate Innovation, ESG & Sustainability, AI & Deep Technology, People Transformation, and The Future of Investment.",
    eventType: 'conference',
    date: '2026-01-08',
    startTime: '09:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'Madurai, India',
    address: 'Madurai, Tamil Nadu, India',
    registrationLink: 'https://tamilrise.org/summit/',
    organizerId: 'the-rise-org',
    organizerName: 'The RISE – Global Tamil Entrepreneurs Summit',
    speakers: [],
  },
  {
    title: 'London Tamil Market 2026',
    description: 'The British Tamil Chamber of Commerce\'s iconic two-day market event welcoming Tamil entrepreneurs to showcase products and services, connect with fellow entrepreneurs, and forge valuable partnerships and collaborations.',
    eventType: 'networking',
    date: '2026-03-07',
    startTime: '10:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'London, UK',
    address: 'Crystal Banqueting Hall, London',
    registrationLink: 'https://www.tamilchamberofcommerce.org.uk/london-tamil-market/ltm-2026/',
    organizerId: 'btcc-org',
    organizerName: 'British Tamil Chamber of Commerce',
    speakers: [],
  },
  {
    title: '12th World Tamils Economic Conference',
    description: 'A premier global summit serving as a gateway to forging strategic partnerships, unlocking new markets, and driving socio-economic progress within the Tamil community and beyond. Brought together international entrepreneurs, policymakers, investors, professionals, and thought leaders from more than 50 countries.',
    eventType: 'conference',
    date: '2025-10-03',
    startTime: '09:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'Washington D.C., USA',
    address: 'Washington D.C., USA',
    registrationLink: 'https://12thwtecdc.com/',
    organizerId: 'wtec-org',
    organizerName: 'World Tamils Economic Conference',
    speakers: [],
  },
  {
    title: 'Tamil Nadu Global Startup Summit 2025',
    description: 'Premier startup summit connecting entrepreneurs, investors, and innovators. Showcasing high-potential startups and game-changing innovations from across Tamil Nadu and the global Tamil diaspora.',
    eventType: 'conference',
    date: '2025-10-09',
    startTime: '09:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'Coimbatore, India',
    address: 'Coimbatore, Tamil Nadu, India',
    registrationLink: 'https://tngss.startuptn.in/',
    organizerId: 'startuptn-org',
    organizerName: 'StartupTN – Government of Tamil Nadu',
    speakers: [],
  },
]

function toFirestoreFields(obj) {
  const fields = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue
    if (typeof val === 'string') fields[key] = { stringValue: val }
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val }
    else if (typeof val === 'number') fields[key] = { integerValue: String(val) }
    else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(v => typeof v === 'string' ? { stringValue: v } : { integerValue: String(v) }),
        },
      }
    }
  }
  return { fields }
}

async function seed() {
  console.log(`Seeding ${events.length} real Tamil business events into production Firestore...\n`)
  const now = new Date().toISOString()
  let ok = 0

  for (const event of events) {
    const payload = toFirestoreFields({
      ...event,
      createdAt: now,
      updatedAt: now,
    })

    const res = await fetch(`${BASE_URL}/events?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      const id = data.name?.split('/').pop()
      console.log(`  ✓ [${event.date}] ${event.title} → ${id}`)
      ok++
    } else {
      const err = await res.json().catch(() => ({}))
      console.error(`  ✗ ${event.title}: ${err.error?.message ?? `HTTP ${res.status}`}`)
    }
  }

  console.log(`\nDone: ${ok}/${events.length} events added to production Firestore.`)
}

seed()
