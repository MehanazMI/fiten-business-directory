import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BusinessModal from '@/app/directory/BusinessModal'
import { makeBusiness } from './fixtures'

function setup(overrides = {}, lang: 'en' | 'ta' = 'en') {
  const business = makeBusiness(overrides)
  const onClose = vi.fn()
  const onClaim = vi.fn()
  const user = userEvent.setup()
  render(<BusinessModal business={business} lang={lang} onClose={onClose} onClaim={onClaim} />)
  return { user, business, onClose, onClaim }
}

describe('BusinessModal — renders nothing for null business', () => {
  it('returns null when business is null', () => {
    const { container } = render(<BusinessModal business={null} lang="en" onClose={vi.fn()} onClaim={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('BusinessModal — content', () => {
  it('shows business name', () => {
    setup()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('shows category and city', () => {
    setup()
    expect(screen.getByText(/Tech/)).toBeInTheDocument()
    expect(screen.getByText(/Toronto/)).toBeInTheDocument()
  })

  it('shows description', () => {
    setup()
    expect(screen.getByText('A great tech company')).toBeInTheDocument()
  })

  it('shows website link when present', () => {
    setup({ website: 'https://acme.com' })
    expect(screen.getByRole('link', { name: 'https://acme.com' })).toBeInTheDocument()
  })

  it('hides website section when absent', () => {
    setup({ website: undefined })
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows PRO badge for pro member', () => {
    setup({ pro: true })
    expect(screen.getByText('PRO', { selector: '.pro-badge' })).toBeInTheDocument()
  })

  it('shows Reviews section for pro member', () => {
    setup({ pro: true, rating: 4.5, reviews: 10 })
    expect(screen.getByText('Reviews')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(10)')).toBeInTheDocument()
  })

  it('hides Reviews section for non-pro', () => {
    setup({ pro: false })
    expect(screen.queryByText('Reviews')).not.toBeInTheDocument()
  })
})

describe('BusinessModal — B2B signals', () => {
  it('shows B2B Signals section when looking is non-empty', () => {
    setup({ looking: ['partner'] })
    expect(screen.getByText('B2B Signals')).toBeInTheDocument()
    expect(screen.getByText(/Business Partners/)).toBeInTheDocument()
  })

  it('shows B2B Signals section when speaker is true', () => {
    setup({ looking: [], speaker: true })
    expect(screen.getByText('B2B Signals')).toBeInTheDocument()
  })

  it('hides B2B Signals section when no signals present', () => {
    setup({ looking: [], speaker: false, women: false, convention: false })
    expect(screen.queryByText('B2B Signals')).not.toBeInTheDocument()
  })
})

describe('BusinessModal — footer actions', () => {
  it('shows Connect button for pro business', () => {
    setup({ pro: true })
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
  })

  it('shows Claim Listing button for non-pro', () => {
    setup({ pro: false })
    expect(screen.getByRole('button', { name: 'Claim Listing' })).toBeInTheDocument()
  })

  it('calls onClose when Connect is clicked', async () => {
    const { user, onClose } = setup({ pro: true })
    await user.click(screen.getByRole('button', { name: 'Connect' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClaim with businessName and then onClose when Claim Listing is clicked', async () => {
    const { user, onClaim, onClose, business } = setup({ pro: false })
    await user.click(screen.getByRole('button', { name: 'Claim Listing' }))
    expect(onClaim).toHaveBeenCalledWith(business.businessName)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows Share button', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('copies business URL to clipboard when Share is clicked', async () => {
    const writeSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const { user, business } = setup()
    await user.click(screen.getByRole('button', { name: 'Share' }))
    expect(writeSpy).toHaveBeenCalledWith(
      `https://fiten-directory.vercel.app/directory/${business.id}`
    )
  })
})

describe('BusinessModal — close behaviour', () => {
  it('calls onClose when close button (×) is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: '×' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay backdrop is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: '×' }).closest('.detail-overlay')!)
    expect(onClose).toHaveBeenCalled()
  })
})

describe('BusinessModal — language', () => {
  it('shows Tamil name in ta mode', () => {
    setup({ nameTamil: 'அக்மே கார்ப்' }, 'ta')
    expect(screen.getByText('அக்மே கார்ப்')).toBeInTheDocument()
  })

  it('shows English sub-name alongside Tamil name', () => {
    setup({ nameTamil: 'அக்மே கார்ப்' }, 'ta')
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })
})
