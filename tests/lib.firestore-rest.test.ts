import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchBusinesses, fetchBusinessById } from '@/lib/firestore-rest'
import { RAW_FIRESTORE_DOC } from './fixtures'

// fetchBusinesses / fetchBusinessById use global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-proj'
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('parseFirestoreDoc (via fetchBusinesses)', () => {
  it('parses all fields correctly from a REST document', async () => {
    mockFetch.mockReturnValue(makeResponse({ documents: [RAW_FIRESTORE_DOC] }))
    const results = await fetchBusinesses()
    const b = results[0]

    expect(b.id).toBe('abc123')
    expect(b.businessName).toBe('Raw Business')
    expect(b.nameTamil).toBe('ரா பிசினஸ்')
    expect(b.category).toBe('Food')           // mapped via categoryMap
    expect(b.city).toBe('Chennai')
    expect(b.region).toBe('Tamil Nadu')
    expect(b.pro).toBe(true)
    expect(b.women).toBe(true)
    expect(b.speaker).toBe(false)
    expect(b.looking).toEqual(['partner', 'hire'])
    expect(b.views).toBe(150)
    expect(b.status).toBe('active')
  })

  it('derives initials from businessName', async () => {
    mockFetch.mockReturnValue(makeResponse({ documents: [RAW_FIRESTORE_DOC] }))
    const [b] = await fetchBusinesses()
    expect(b.initials).toBe('RB')
  })

  it('derives initials as ?? for empty businessName', async () => {
    const doc = { ...RAW_FIRESTORE_DOC, fields: { ...RAW_FIRESTORE_DOC.fields, businessName: { stringValue: '' } } }
    mockFetch.mockReturnValue(makeResponse({ documents: [doc] }))
    const [b] = await fetchBusinesses()
    expect(b.initials).toBe('??')
  })

  it('truncates initials to 2 characters', async () => {
    const doc = { ...RAW_FIRESTORE_DOC, fields: { ...RAW_FIRESTORE_DOC.fields, businessName: { stringValue: 'Alpha Beta Gamma' } } }
    mockFetch.mockReturnValue(makeResponse({ documents: [doc] }))
    const [b] = await fetchBusinesses()
    expect(b.initials).toBe('AB')
  })

  it('uses raw category string if not in categoryMap', async () => {
    const doc = { ...RAW_FIRESTORE_DOC, fields: { ...RAW_FIRESTORE_DOC.fields, category: { stringValue: 'Veterinary' } } }
    mockFetch.mockReturnValue(makeResponse({ documents: [doc] }))
    const [b] = await fetchBusinesses()
    expect(b.category).toBe('Veterinary')
  })

  it('defaults missing boolean fields to false', async () => {
    const { pro, speaker, women, convention, ...rest } = RAW_FIRESTORE_DOC.fields
    const doc = { ...RAW_FIRESTORE_DOC, fields: rest }
    mockFetch.mockReturnValue(makeResponse({ documents: [doc] }))
    const [b] = await fetchBusinesses()
    expect(b.pro).toBe(false)
    expect(b.speaker).toBe(false)
    expect(b.women).toBe(false)
    expect(b.convention).toBe(false)
  })

  it('defaults missing looking array to []', async () => {
    const { looking, ...rest } = RAW_FIRESTORE_DOC.fields
    const doc = { ...RAW_FIRESTORE_DOC, fields: rest }
    mockFetch.mockReturnValue(makeResponse({ documents: [doc] }))
    const [b] = await fetchBusinesses()
    expect(b.looking).toEqual([])
  })

})

describe('fetchBusinesses', () => {
  it('returns only active businesses', async () => {
    const pending = { ...RAW_FIRESTORE_DOC, name: '...businesses/inactive1', fields: { ...RAW_FIRESTORE_DOC.fields, status: { stringValue: 'pending' } } }
    mockFetch.mockReturnValue(makeResponse({ documents: [RAW_FIRESTORE_DOC, pending] }))
    const results = await fetchBusinesses()
    expect(results).toHaveLength(1)
    expect(results[0].status).toBe('active')
  })

  it('returns empty array when no documents', async () => {
    mockFetch.mockReturnValue(makeResponse({}))
    const results = await fetchBusinesses()
    expect(results).toEqual([])
  })

  it('throws when Firestore returns non-OK response', async () => {
    mockFetch.mockReturnValue(makeResponse({}, false, 503))
    await expect(fetchBusinesses()).rejects.toThrow('503')
  })
})

describe('fetchBusinessById', () => {
  it('returns parsed business on success', async () => {
    mockFetch.mockReturnValue(makeResponse(RAW_FIRESTORE_DOC))
    const b = await fetchBusinessById('abc123')
    expect(b).not.toBeNull()
    expect(b!.id).toBe('abc123')
  })

  it('returns null on 404', async () => {
    mockFetch.mockReturnValue(makeResponse({}, false, 404))
    const b = await fetchBusinessById('nonexistent')
    expect(b).toBeNull()
  })

  it('returns null on any non-OK response', async () => {
    mockFetch.mockReturnValue(makeResponse({}, false, 500))
    const b = await fetchBusinessById('x')
    expect(b).toBeNull()
  })
})
