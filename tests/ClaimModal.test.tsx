import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClaimModal from '@/app/directory/ClaimModal'

function mockFetchOk() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
}

function setup(businessName: string | null = 'Acme Corp') {
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<ClaimModal businessId={businessName ? 'biz-001' : null} businessName={businessName} onClose={onClose} />)
  return { user, onClose }
}

beforeEach(() => { vi.unstubAllGlobals() })

describe('ClaimModal — renders nothing when businessName is null', () => {
  it('returns null', () => {
    const { container } = render(<ClaimModal businessId={null} businessName={null} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('ClaimModal — initial state', () => {
  it('shows the business name in the prompt', () => {
    setup('Acme Corp')
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument()
  })

  it('renders email input', () => {
    setup()
    expect(screen.getByPlaceholderText('your@businessemail.com')).toBeInTheDocument()
  })

  it('renders Send Verification Email button', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Send Verification Email' })).toBeInTheDocument()
  })
})

describe('ClaimModal — submission', () => {
  it('does not submit when email is empty', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Send Verification Email' }))
    expect(screen.queryByText('Claim Submitted')).not.toBeInTheDocument()
  })

  it('shows success state after valid email is submitted', async () => {
    mockFetchOk()
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@businessemail.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send Verification Email' }))
    expect(await screen.findByText('Claim Submitted')).toBeInTheDocument()
  })

  it('shows the submitted email in success message', async () => {
    mockFetchOk()
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@businessemail.com'), 'owner@acme.com')
    await user.click(screen.getByRole('button', { name: 'Send Verification Email' }))
    expect(await screen.findByText(/owner@acme\.com/)).toBeInTheDocument()
  })

  it('shows success checkmark after submission', async () => {
    mockFetchOk()
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@businessemail.com'), 'a@b.com')
    await user.click(screen.getByRole('button', { name: 'Send Verification Email' }))
    expect(await screen.findByText('✓')).toBeInTheDocument()
  })
})

describe('ClaimModal — close behaviour', () => {
  it('calls onClose when × button is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: '×' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay backdrop is clicked', async () => {
    const { user, onClose } = setup()
    // click the overlay element (parent of claim-modal)
    const overlay = document.querySelector('.detail-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })
})
