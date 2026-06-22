import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConnectPreview from '@/app/components/home/ConnectPreview'
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
  makeBusiness({ id: 'p1', businessName: 'Partner Co', looking: ['partner'], pro: true }),
  makeBusiness({ id: 'i1', businessName: 'Invest Co', looking: ['invest'] }),
  makeBusiness({ id: 'n1', businessName: 'No Signal Co', looking: [] }),
]

function setup(businesses = BUSINESSES) {
  const user = userEvent.setup()
  render(<ConnectPreview businesses={businesses} />)
  return { user }
}

describe('ConnectPreview', () => {
  it('shows only businesses that are looking for something', () => {
    setup()
    expect(screen.getByText('Partner Co')).toBeInTheDocument()
    expect(screen.getByText('Invest Co')).toBeInTheDocument()
    expect(screen.queryByText('No Signal Co')).not.toBeInTheDocument()
  })

  it('links to the connect page', () => {
    setup()
    expect(screen.getByRole('link', { name: /See All Opportunities/i })).toHaveAttribute('href', '/connect')
  })

  it('navigates to the detail page when a card is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Partner Co'))
    expect(push).toHaveBeenCalledWith('/directory/p1')
  })

  it('renders nothing when no business is looking', () => {
    const { container } = render(
      <ConnectPreview businesses={[makeBusiness({ looking: [] })]} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
