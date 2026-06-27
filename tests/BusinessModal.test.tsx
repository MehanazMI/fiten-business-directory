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

  it('shows PRO badge for pro member', () => {
    setup({ pro: true })
    expect(screen.getByText(/FeTNA Sponsor/, { selector: '.pro-badge' })).toBeInTheDocument()
  })

})

describe('BusinessModal — contact details', () => {
  it('shows email', () => {
    setup({ email: 'hello@acme.com' })
    expect(screen.getByRole('link', { name: 'hello@acme.com' })).toBeInTheDocument()
  })

  it('shows phone when present', () => {
    setup({ phone: '+1 647 123 4567' })
    expect(screen.getByText('+1 647 123 4567')).toBeInTheDocument()
  })

  it('shows website when present', () => {
    setup({ website: 'https://acme.com' })
    expect(screen.getByRole('link', { name: 'acme.com' })).toBeInTheDocument()
  })
})

describe('BusinessModal — B2B signals', () => {
  it('shows Open to section when looking is non-empty', () => {
    setup({ looking: ['partner'] })
    expect(screen.getByText('Open to')).toBeInTheDocument()
    expect(screen.getByText('Partner')).toBeInTheDocument()
  })

  it('shows Open to section when speaker is true', () => {
    setup({ looking: [], speaker: true })
    expect(screen.getByText('Open to')).toBeInTheDocument()
  })

  it('hides Open to section when no signals present', () => {
    setup({ looking: [], speaker: false, women: false, convention: false })
    expect(screen.queryByText('Open to')).not.toBeInTheDocument()
  })
})

describe('BusinessModal — footer actions', () => {
  it('shows WhatsApp connect button for pro business with phone', () => {
    setup({ pro: true, phone: '+1234567890' })
    expect(screen.getByRole('button', { name: /WhatsApp/ })).toBeInTheDocument()
  })

  it('shows Email connect button for pro business without phone', () => {
    setup({ pro: true, phone: undefined })
    expect(screen.getByRole('button', { name: /Email/ })).toBeInTheDocument()
  })

  it('shows Claim button for non-pro', () => {
    setup({ pro: false })
    expect(screen.getByRole('button', { name: 'Claim' })).toBeInTheDocument()
  })

  it('opens WhatsApp when Connect is clicked and phone exists', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { user } = setup({ pro: true, phone: '+16471234567' })
    await user.click(screen.getByRole('button', { name: /WhatsApp/ }))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/16471234567'),
      '_blank'
    )
  })

  it('opens mailto when Connect is clicked and no phone', async () => {
    const { user } = setup({ pro: true, phone: undefined, email: 'hello@acme.com' })
    await user.click(screen.getByRole('button', { name: /Email/ }))
    expect(window.location.href).toContain('mailto:hello@acme.com')
  })

  it('calls onClaim with businessName and then onClose when Claim is clicked', async () => {
    const { user, onClaim, onClose, business } = setup({ pro: false })
    await user.click(screen.getByRole('button', { name: 'Claim' }))
    expect(onClaim).toHaveBeenCalledWith(business.id, business.businessName)
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
      `https://fiten-business-directory.vercel.app/directory/${business.id}`
    )
  })

  it('shows Copied ✓ feedback after Share is clicked', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('button', { name: 'Copied ✓' })).toBeInTheDocument()
  })
})

describe('BusinessModal — close behaviour', () => {
  it('calls onClose when close button is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay backdrop is clicked', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Close' }).closest('.detail-overlay')!)
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

describe('BusinessModal — visit count', () => {
  it('shows visit count when views > 0', () => {
    setup({ views: 200 })
    expect(screen.getByText(/200 visits/)).toBeInTheDocument()
  })
})
