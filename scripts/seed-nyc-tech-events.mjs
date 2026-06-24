// One-time script: seed NYC-area tech events into production Firestore
const PROJECT_ID = 'fiten-business-directory'
const API_KEY = 'AIzaSyAtvJuRVFrbQb4kYrykjeu4YZKzyhqUKnU'
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

const events = [
  // ── UPCOMING ────────────────────────────────────────────────────────────
  {
    title: 'Brooklyn Tech Expo — FALL4AI Edition 2026',
    description: "Brooklyn's largest AI & tech conference returns for the Fall edition, spotlighting artificial intelligence, emerging technology, and innovation. Brings together C-level executives, founders, and industry leaders for a day of AI seminars, exhibitor showcases, expert-led sessions, networking, and complimentary professional headshots.",
    eventType: 'conference',
    date: '2026-10-06',
    startTime: '11:00',
    endTime: '16:00',
    location: 'in-person',
    city: 'Brooklyn, NY',
    address: '26 Bridge St, DUMBO, Brooklyn, NY 11201',
    registrationLink: 'https://www.eventbrite.com/e/brooklyn-tech-expo-fall4ai-edition-oct-6-2026-tickets-1989878874279',
    organizerId: 'pulse-nyc',
    organizerName: 'Pulse NYC',
    region: 'nyc',
    speakers: [],
  },

  // ── PAST ────────────────────────────────────────────────────────────────
  {
    title: 'TTEC SPARK \'26 — Tamil Tech Entrepreneur National Summit',
    description: "TTEC's flagship annual summit brought together Tamil technology entrepreneurs, investors, executives, and innovators from across the United States. Featured keynote presentations, AI & emerging technology panels, strategic networking and matchmaking sessions, government contracting insights, and a startup pitch competition.",
    eventType: 'conference',
    date: '2026-04-24',
    startTime: '09:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'Morristown, NJ',
    address: 'Hyatt Regency Morristown, 3 Speedwell Ave, Morristown, NJ 07960',
    registrationLink: 'https://ttecna.org/upcoming_events',
    organizerId: 'ttec-org',
    organizerName: 'TTEC — Tamil Tech Entrepreneur Council',
    region: 'nyc',
    speakers: [],
  },
  {
    title: 'Annual Brooklyn Tech Expo 2026',
    description: "Premier tech expo in the heart of DUMBO, Brooklyn — uniting over 1,000 tech professionals, startup founders, C-level executives, and investors for a full day of innovation showcases, AI seminars, networking, and emerging technology exhibits. One of NYC's biggest annual tech gatherings.",
    eventType: 'conference',
    date: '2026-05-12',
    startTime: '11:00',
    endTime: '16:00',
    location: 'in-person',
    city: 'Brooklyn, NY',
    address: '26 Bridge St, DUMBO, Brooklyn, NY 11201',
    registrationLink: 'https://pulse.nyc/brooklyn-tech-expo/',
    organizerId: 'pulse-nyc',
    organizerName: 'Pulse NYC',
    region: 'nyc',
    speakers: [],
  },
  {
    title: 'Brooklyn Tech Expo — TECH4LIFE Edition 2026',
    description: "The year's first Brooklyn Tech Expo edition focused on life-enriching technology — AI in healthcare, wellness tech, and smart living. Featured exhibitor showcases, expert-led seminars, networking, and the signature complimentary professional headshot sessions in the iconic DUMBO neighbourhood.",
    eventType: 'conference',
    date: '2026-02-11',
    startTime: '11:00',
    endTime: '16:00',
    location: 'in-person',
    city: 'Brooklyn, NY',
    address: '26 Bridge St, DUMBO, Brooklyn, NY 11201',
    registrationLink: 'https://luma.com/brooklyn-tech-expo-feb-2026',
    organizerId: 'pulse-nyc',
    organizerName: 'Pulse NYC',
    region: 'nyc',
    speakers: [],
  },
  {
    title: 'TTEC SPARK \'24 — Tamil Tech Innovation Summit',
    description: "The 2024 edition of TTEC's flagship SPARK conference united Tamil tech entrepreneurs, innovators, and investors for a day of keynotes, panel discussions, networking, and the Innovation Igniters startup showcase — where TTEC members demonstrated their latest products and solutions.",
    eventType: 'conference',
    date: '2024-07-04',
    startTime: '09:00',
    endTime: '18:00',
    location: 'in-person',
    city: 'Dallas, TX',
    address: 'Dallas, Texas, USA',
    registrationLink: 'https://ttecna.org/spark_24',
    organizerId: 'ttec-org',
    organizerName: 'TTEC — Tamil Tech Entrepreneur Council',
    region: 'nyc',
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
      fields[key] = { arrayValue: { values: val.map(v => ({ stringValue: String(v) })) } }
    }
  }
  return { fields }
}

async function seed() {
  const now = new Date().toISOString()
  console.log(`Seeding ${events.length} NYC tech events into production Firestore...\n`)
  let ok = 0

  for (const event of events) {
    const res = await fetch(`${BASE_URL}/events?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreFields({ ...event, createdAt: now, updatedAt: now })),
    })
    if (res.ok) {
      const data = await res.json()
      console.log(`  ✓ [${event.date}] ${event.title}`)
      ok++
    } else {
      const err = await res.json().catch(() => ({}))
      console.error(`  ✗ ${event.title}: ${err.error?.message ?? `HTTP ${res.status}`}`)
    }
  }
  console.log(`\nDone: ${ok}/${events.length} events seeded.`)
}

seed()
