import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClaimModal from '@/app/directory/ClaimModal'

function setup(businessName: string | null = 'Acme Corp') {
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<ClaimModal businessName={businessName} onClose={onClose} />)
  return { user, onClose }
}

describe('ClaimModal — renders nothing when businessName is null', () => {
  it('returns null', () => {
    const { container } = render(<ClaimModal businessName={null} onClose={vi.fn()} />)
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
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
  })

  it('renders Submit Claim button', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Submit Claim' })).toBeInTheDocument()
  })
})

describe('ClaimModal — submission', () => {
  it('does not submit when email is empty', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Submit Claim' }))
    expect(screen.queryByText('Claim Submitted')).not.toBeInTheDocument()
  })

  it('shows success state after valid email is submitted', async () => {
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit Claim' }))
    expect(screen.getByText('Claim Submitted')).toBeInTheDocument()
  })

  it('shows the submitted email in success message', async () => {
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@email.com'), 'owner@acme.com')
    await user.click(screen.getByRole('button', { name: 'Submit Claim' }))
    expect(screen.getByText(/owner@acme\.com/)).toBeInTheDocument()
  })

  it('shows success checkmark after submission', async () => {
    const { user } = setup()
    await user.type(screen.getByPlaceholderText('your@email.com'), 'a@b.com')
    await user.click(screen.getByRole('button', { name: 'Submit Claim' }))
    expect(screen.getByText('✓')).toBeInTheDocument()
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
