import '@testing-library/jest-dom'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Firebase client
vi.mock('@/lib/firebase-client', () => ({
  db: {},
}))

// Mock Firestore SDK
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()), // returns unsubscribe fn
  query: vi.fn(),
  where: vi.fn(),
}))

// Stub clipboard + location for share tests
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
})
Object.defineProperty(window, 'location', {
  value: { origin: 'https://fiten-directory.vercel.app' },
  writable: true,
})

// Stub localStorage
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
})
