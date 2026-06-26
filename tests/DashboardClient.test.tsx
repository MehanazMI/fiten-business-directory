import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardClient from '@/app/dashboard/DashboardClient'

const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockGetDocs = vi.fn()
const mockUpdateDoc = vi.fn()

vi.mock('firebase/auth', () => ({
  signInWithPopup: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'collRef'),
  query: vi.fn(() => 'queryRef'),
  where: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  doc: vi.fn(() => 'docRef'),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
}))

vi.mock('@/lib/firebase-client', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}))

const mockUseAuth = vi.fn()
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

const MOCK_BIZ = {
  id: 'biz-1',
  businessName: 'Acme Tamil Tech',
  description: 'We build software.',
  category: 'Technology',
  email: 'owner@acme.com',
  phone: '416-555-0001',
  status: 'active',
  looking: ['partner', 'hire'],
  women: false,
  speaker: true,
}

function makeSnap(biz: typeof MOCK_BIZ | null) {
  if (!biz) return { empty: true, docs: [] }
  const { id, ...rest } = biz
  return { empty: false, docs: [{ id, data: () => rest }] }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ── Not authenticated ──────────────────────────────────────────────────────

describe('DashboardClient — not authenticated', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('shows sign-in gate heading', () => {
    render(<DashboardClient />)
    expect(screen.getByText(/sign in to manage your listings/i)).toBeInTheDocument()
  })

  it('shows Sign in with Google button', () => {
    render(<DashboardClient />)
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('calls signInWithPopup on Google button click', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({})
    render(<DashboardClient />)
    await user.click(screen.getByRole('button', { name: /sign in with google/i }))
    expect(mockSignIn).toHaveBeenCalled()
  })

  it('does not call getDocs when unauthenticated', () => {
    render(<DashboardClient />)
    expect(mockGetDocs).not.toHaveBeenCalled()
  })
})

// ── Auth loading ───────────────────────────────────────────────────────────

describe('DashboardClient — auth loading', () => {
  it('renders nothing while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    const { container } = render(<DashboardClient />)
    expect(container).toBeEmptyDOMElement()
  })
})

// ── Authenticated, listing found ───────────────────────────────────────────

describe('DashboardClient — authenticated, listing found', () => {
  const MOCK_USER = { email: 'owner@acme.com', displayName: 'Owner' }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { ...MOCK_USER, uid: 'uid-1' }, loading: false })
    mockGetDocs.mockResolvedValue(makeSnap(MOCK_BIZ))
  })

  it('shows business name', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText('Acme Tamil Tech')).toBeInTheDocument())
  })

  it('shows status "Live" for active listings', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText('Live')).toBeInTheDocument())
  })

  it('shows status "Pending Review" for pending listings', async () => {
    mockGetDocs.mockResolvedValue(makeSnap({ ...MOCK_BIZ, status: 'pending' }))
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText('Pending Review')).toBeInTheDocument())
  })

  it('shows description in view mode', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText('We build software.')).toBeInTheDocument())
  })

  it('shows link to public listing', async () => {
    render(<DashboardClient />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /view public listing/i })
      expect(link).toHaveAttribute('href', '/directory/biz-1')
    })
  })

  it('shows signed-in email', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText(/owner@acme\.com/)).toBeInTheDocument())
  })

  it('shows sign out button', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument())
  })

  it('calls signOut when sign out clicked', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({})
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /sign out/i }))
    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('shows Edit Listing button', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument())
  })
})

// ── Authenticated, no listing ──────────────────────────────────────────────

describe('DashboardClient — authenticated, no listing found', () => {
  const MOCK_USER = { email: 'nobody@example.com', displayName: 'Nobody', uid: 'uid-nobody' }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, loading: false })
    mockGetDocs.mockResolvedValue(makeSnap(null))
  })

  it('shows no-listing message', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText(/no listings found/i)).toBeInTheDocument())
  })

  it('shows the signed-in email in the no-listing message', async () => {
    render(<DashboardClient />)
    await waitFor(() => expect(screen.getByText(/nobody@example\.com/i)).toBeInTheDocument())
  })

  it('shows Add Your Business link pointing to /form', async () => {
    render(<DashboardClient />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /add your business/i })
      expect(link).toHaveAttribute('href', '/form')
    })
  })
})

// ── Edit flow ──────────────────────────────────────────────────────────────

describe('DashboardClient — edit flow', () => {
  const MOCK_USER = { email: 'owner@acme.com', displayName: 'Owner', uid: 'uid-owner' }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, loading: false })
    mockGetDocs.mockResolvedValue(makeSnap(MOCK_BIZ))
  })

  it('clicking Edit Listing reveals Save Changes and Cancel buttons', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('Cancel exits edit mode and restores Edit Listing button', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
  })

  it('edit form pre-populates description field', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(screen.getByDisplayValue('We build software.')).toBeInTheDocument()
  })

  it('edit form pre-populates phone field', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(screen.getByDisplayValue('416-555-0001')).toBeInTheDocument()
  })

  it('Save Changes calls updateDoc with existing field values', async () => {
    const user = userEvent.setup()
    mockUpdateDoc.mockResolvedValue({})
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(mockUpdateDoc).toHaveBeenCalledWith(
      'docRef',
      expect.objectContaining({
        description: 'We build software.',
        category: 'Technology',
        phone: '416-555-0001',
        looking: ['partner', 'hire'],
        women: false,
        speaker: true,
      })
    ))
  })

  it('shows "Saved ✓" confirmation after successful save', async () => {
    const user = userEvent.setup()
    mockUpdateDoc.mockResolvedValue({})
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument())
  })

  it('exits edit mode after successful save', async () => {
    const user = userEvent.setup()
    mockUpdateDoc.mockResolvedValue({})
    render(<DashboardClient />)
    await waitFor(() => screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument())
  })
})
