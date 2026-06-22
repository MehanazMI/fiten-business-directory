import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeaturedListings from '@/app/components/home/FeaturedListings'
import { makeBusiness } from './fixtures'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  push.mockClear()
})

const BUSINESSES = [
  makeBusiness({ id: 't1', businessName: 'Tech One', category: 'Tech', pro: true }),
  makeBusiness({ id: 'f1', businessName: 'Food One', category: 'Food' }),
  makeBusiness({ id: 'f2', businessName: 'Food Two', category: 'Food' }),
]

function setup(businesses = BUSINESSES) {
  const user = userEvent.setup()
  render(<FeaturedListings businesses={businesses} />)
  return { user }
}

describe('FeaturedListings', () => {
  it('shows the pro business as the spotlight first', () => {
    setup()
    // Spotlight renders the full card; pro is sorted to the front.
    const names = Array.from(document.querySelectorAll('.biz-name')).map(el => el.textContent)
    expect(names[0]).toBe('Tech One')
  })

  it('lists the remaining businesses in the supporting strip', () => {
    setup()
    expect(screen.getByText('Food One')).toBeInTheDocument()
    expect(screen.getByText('Food Two')).toBeInTheDocument()
  })

  it('navigates to the detail page when a strip item is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Food One'))
    expect(push).toHaveBeenCalledWith('/directory/f1')
  })

  it('renders a dot control per business', () => {
    setup()
    expect(document.querySelectorAll('.featured-dot').length).toBe(BUSINESSES.length)
  })

  it('has a link to the full directory', () => {
    setup()
    expect(screen.getByRole('link', { name: /Browse the Full Directory/i })).toHaveAttribute('href', '/directory')
  })

  it('still renders the title when there are no businesses', () => {
    setup([])
    expect(screen.getByText(/Meet the/)).toBeInTheDocument()
    expect(document.querySelectorAll('.featured-dot').length).toBe(0)
  })
})
