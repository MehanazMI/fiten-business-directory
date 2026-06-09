import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BusinessCard from '@/app/directory/BusinessCard'
import { makeBusiness } from './fixtures'

function setup(overrides = {}, isFavorited = false) {
  const business = makeBusiness(overrides)
  const onSelect = vi.fn()
  const onFavorite = vi.fn()
  const user = userEvent.setup()
  render(<BusinessCard business={business} isFavorited={isFavorited} onSelect={onSelect} onFavorite={onFavorite} lang="en" />)
  return { user, business, onSelect, onFavorite }
}

describe('BusinessCard — display', () => {
  it('renders the business name', () => {
    setup()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders category and city', () => {
    setup()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText(/Toronto/)).toBeInTheDocument()
  })

  it('renders avatar initials', () => {
    setup()
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('renders description', () => {
    setup()
    expect(screen.getByText('A great tech company')).toBeInTheDocument()
  })

  it('shows PRO banner for pro businesses', () => {
    setup({ pro: true })
    expect(screen.getByText(/PRO Member/)).toBeInTheDocument()
  })

  it('does not show PRO banner for non-pro businesses', () => {
    setup({ pro: false })
    expect(screen.queryByText(/PRO Member/)).not.toBeInTheDocument()
  })

  it('shows analytics badge when pro and has views', () => {
    setup({ pro: true, views: 123 })
    expect(screen.getByText(/123 views/)).toBeInTheDocument()
  })

  it('hides analytics badge when views is 0', () => {
    setup({ pro: true, views: 0 })
    expect(screen.queryByText(/views/)).not.toBeInTheDocument()
  })
})

describe('BusinessCard — B2B signals', () => {
  it('renders "partner" signal', () => {
    setup({ looking: ['partner'] })
    expect(screen.getByText(/Business Partners/)).toBeInTheDocument()
  })

  it('renders "hire" signal', () => {
    setup({ looking: ['hire'] })
    expect(screen.getByText(/Hiring/)).toBeInTheDocument()
  })

  it('renders speaker badge', () => {
    setup({ speaker: true })
    expect(screen.getByText(/Speaker/)).toBeInTheDocument()
  })

  it('renders women-led badge', () => {
    setup({ women: true })
    expect(screen.getByText(/Women-Led/)).toBeInTheDocument()
  })

  it('renders convention badge', () => {
    setup({ convention: true })
    expect(screen.getByText(/FeTNA/)).toBeInTheDocument()
  })

  it('renders no signal badges when looking is empty and all flags false', () => {
    setup({ looking: [], speaker: false, women: false, convention: false })
    expect(screen.queryByText(/Business Partners/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Hiring/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Speaker/)).not.toBeInTheDocument()
  })
})

describe('BusinessCard — favorites', () => {
  it('shows unfavorited heart when not favorited', () => {
    setup()
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
  })

  it('shows filled heart when favorited', () => {
    const business = makeBusiness()
    render(<BusinessCard business={business} isFavorited={true} onSelect={vi.fn()} onFavorite={vi.fn()} lang="en" />)
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('calls onFavorite with business id when heart is clicked', async () => {
    const { user, onFavorite, business } = setup()
    await user.click(screen.getByLabelText('Add to favorites'))
    expect(onFavorite).toHaveBeenCalledWith(business.id)
  })

  it('does not call onSelect when heart is clicked (stopPropagation)', async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByLabelText('Add to favorites'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('BusinessCard — interactions', () => {
  it('calls onSelect when card is clicked', async () => {
    const { user, onSelect, business } = setup()
    await user.click(screen.getByText('Acme Corp'))
    expect(onSelect).toHaveBeenCalledWith(business)
  })

  it('shows View button for pro card', () => {
    setup({ pro: true })
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
  })

  it('shows Claim button for non-pro card', () => {
    setup({ pro: false })
    expect(screen.getByRole('button', { name: 'Claim' })).toBeInTheDocument()
  })

  it('shows PRO upgrade button for non-pro card', () => {
    setup({ pro: false })
    expect(screen.getByRole('button', { name: 'PRO' })).toBeInTheDocument()
  })
})

describe('BusinessCard — language', () => {
  it('shows Tamil name in ta mode when nameTamil is present', () => {
    const business = makeBusiness({ nameTamil: 'அக்மே கார்ப்' })
    render(<BusinessCard business={business} isFavorited={false} onSelect={vi.fn()} onFavorite={vi.fn()} lang="ta" />)
    expect(screen.getByText('அக்மே கார்ப்')).toBeInTheDocument()
  })

  it('falls back to English name in ta mode when nameTamil is absent', () => {
    const business = makeBusiness({ nameTamil: undefined })
    render(<BusinessCard business={business} isFavorited={false} onSelect={vi.fn()} onFavorite={vi.fn()} lang="ta" />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })
})

describe('BusinessCard — star rating', () => {
  it('renders 5 star characters', () => {
    setup({ rating: 4 })
    const stars = screen.getByText(/[★☆]{5}/)
    expect(stars).toBeInTheDocument()
  })

  it('shows rating value and review count', () => {
    setup({ rating: 4.5, reviews: 12 })
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })
})
