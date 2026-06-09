import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/app/directory/SearchBar'

function setup(value = '', onChange = vi.fn()) {
  const user = userEvent.setup()
  render(<SearchBar value={value} placeholder="Search businesses..." searchLabel="Search" onChange={onChange} />)
  return { user, onChange }
}

describe('SearchBar', () => {
  it('renders input with correct placeholder', () => {
    setup()
    expect(screen.getByPlaceholderText('Search businesses...')).toBeInTheDocument()
  })

  it('renders search button with correct label', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('shows the current value in the input', () => {
    setup('hello')
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const { user, onChange } = setup()
    await user.type(screen.getByRole('textbox'), 'acme')
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange with the new value on each keystroke', async () => {
    const { user, onChange } = setup()
    await user.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('calls onChange when input is cleared', async () => {
    const { user, onChange } = setup('existing')
    const input = screen.getByRole('textbox')
    await user.clear(input)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('uses Tamil placeholder and button label in Tamil mode', () => {
    render(<SearchBar value="" placeholder="வணிகங்களைத் தேடுங்கள்..." searchLabel="தேடு" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('வணிகங்களைத் தேடுங்கள்...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'தேடு' })).toBeInTheDocument()
  })
})
