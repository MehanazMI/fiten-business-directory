import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthButton from '@/app/components/AuthButton'

const mockSignIn = vi.fn()
const mockSignOut = vi.fn()

vi.mock('firebase/auth', () => ({
  signInWithPopup: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
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

beforeEach(() => {
  vi.resetAllMocks()
})

describe('AuthButton — loading state', () => {
  it('renders nothing while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    const { container } = render(<AuthButton />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('AuthButton — signed out', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('shows Sign in button', () => {
    render(<AuthButton />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('does not show sign out button', () => {
    render(<AuthButton />)
    expect(screen.queryByTitle(/sign out/i)).not.toBeInTheDocument()
  })

  it('calls signInWithPopup when Sign in is clicked', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({})
    render(<AuthButton />)
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(mockSignIn).toHaveBeenCalledWith({}, {})
  })
})

describe('AuthButton — signed in with photo', () => {
  const mockUser = {
    photoURL: 'https://example.com/photo.jpg',
    displayName: 'Test User',
    email: 'test@example.com',
  }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false })
  })

  it('shows avatar image', () => {
    render(<AuthButton />)
    const img = screen.getByRole('img', { name: /Test User/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockUser.photoURL)
  })

  it('avatar links to /dashboard', () => {
    render(<AuthButton />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('shows sign out button', () => {
    render(<AuthButton />)
    expect(screen.getByTitle(/sign out/i)).toBeInTheDocument()
  })

  it('calls signOut when sign out is clicked', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({})
    render(<AuthButton />)
    await user.click(screen.getByTitle(/sign out/i))
    expect(mockSignOut).toHaveBeenCalledWith({})
  })

  it('does not show Sign in button', () => {
    render(<AuthButton />)
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })
})

describe('AuthButton — signed in without photo', () => {
  const mockUser = {
    photoURL: null,
    displayName: 'Jane Doe',
    email: 'jane@example.com',
  }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false })
  })

  it('shows first-letter initial when no photo URL', () => {
    render(<AuthButton />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('falls back to email initial if displayName is null', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, displayName: null, email: 'zara@example.com' },
      loading: false,
    })
    render(<AuthButton />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })
})
