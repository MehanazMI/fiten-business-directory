import type { Business } from '@/types/business'

export function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'biz-001',
    businessName: 'Acme Corp',
    nameTamil: 'அக்மே கார்ப்',
    category: 'Tech',
    city: 'Toronto',
    region: 'Ontario',
    description: 'A great tech company',
    email: 'hello@acme.com',
    phone: '416-555-0100',
    website: 'https://acme.com',
    status: 'active',
    pro: false,
    verified: false,
    verificationStatus: 'unverified',
    looking: [],
    speaker: false,
    women: false,
    convention: false,
    rating: 4.5,
    reviews: 12,
    views: 200,
    createdAt: '2024-01-01T00:00:00Z',
    initials: 'AC',
    colorIdx: 0,
    ...overrides,
  }
}

export const SAMPLE_BUSINESSES: Business[] = [
  makeBusiness({ id: 'b1', businessName: 'Alpha Tech', category: 'Tech', region: 'Ontario', city: 'Toronto', pro: true, looking: ['partner', 'hire'], views: 500, reviews: 20 }),
  makeBusiness({ id: 'b2', businessName: 'Beta Foods', category: 'Food', region: 'Quebec', city: 'Montreal', pro: false, looking: ['client'], women: true }),
  makeBusiness({ id: 'b3', businessName: 'Gamma Health', category: 'Healthcare', region: 'Ontario', city: 'Ottawa', pro: false, looking: ['invest'], speaker: true }),
  makeBusiness({ id: 'b4', businessName: 'Delta Finance', category: 'Finance', region: 'BC', city: 'Vancouver', pro: true, looking: [], convention: true, views: 300, reviews: 8 }),
  makeBusiness({ id: 'b5', businessName: 'Epsilon Legal', category: 'Legal', region: 'Alberta', city: 'Calgary', pro: false, looking: ['partner', 'client'] }),
  makeBusiness({ id: 'b6', businessName: 'Zeta Retail', category: 'Retail', region: 'Quebec', city: 'Quebec City', pro: false, looking: [] }),
  makeBusiness({ id: 'b7', businessName: 'Eta Services', category: 'Services', region: 'Ontario', city: 'Mississauga', pro: false, looking: ['hire'] }),
]

// A raw Firestore REST document for parseFirestoreDoc tests
export const RAW_FIRESTORE_DOC = {
  name: 'projects/test-proj/databases/(default)/documents/businesses/abc123',
  fields: {
    businessName:  { stringValue: 'Raw Business' },
    nameTamil:     { stringValue: 'ரா பிசினஸ்' },
    category:      { stringValue: 'Food & Beverage' },
    city:          { stringValue: 'Chennai' },
    region:        { stringValue: 'Tamil Nadu' },
    description:   { stringValue: 'A raw test business' },
    email:         { stringValue: 'raw@test.com' },
    phone:         { stringValue: '999-000-1234' },
    website:       { stringValue: 'https://raw.test' },
    status:        { stringValue: 'active' },
    pro:           { booleanValue: true },
    verified:      { booleanValue: true },
    verificationStatus: { stringValue: 'auto' },
    speaker:       { booleanValue: false },
    women:         { booleanValue: true },
    convention:    { booleanValue: false },
    looking:       { arrayValue: { values: [{ stringValue: 'partner' }, { stringValue: 'hire' }] } },
    rating:        { doubleValue: 4.2 },
    reviews:       { integerValue: 7 },
    views:         { integerValue: 150 },
    createdAt:     { timestampValue: '2024-06-01T00:00:00Z' },
  },
}
