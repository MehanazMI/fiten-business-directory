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
  it('renders all businesses under the All chip by default', () => {
    setup()
    expect(screen.getByText('Tech One')).toBeInTheDocument()
    expect(screen.getByText('Food One')).toBeInTheDocument()
    expect(screen.getByText('Food Two')).toBeInTheDocument()
  })

  it('filters to a single category when its chip is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Tech' }))
    expect(screen.getByText('Tech One')).toBeInTheDocument()
    expect(screen.queryByText('Food One')).not.toBeInTheDocument()
  })

  it('navigates to the detail page when a card is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Tech One'))
    expect(push).toHaveBeenCalledWith('/directory/t1')
  })

  it('pro businesses are sorted first', () => {
    setup()
    const names = Array.from(document.querySelectorAll('.biz-name')).map(el => el.textContent)
    expect(names[0]).toBe('Tech One')
  })

  it('has a link to the full directory', () => {
    setup()
    expect(screen.getByRole('link', { name: /Browse the Full Directory/i })).toHaveAttribute('href', '/directory')
  })
})
