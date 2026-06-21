import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AnimatedCounter from '@/app/components/home/AnimatedCounter'

beforeEach(() => {
  // Drive the count-up to completion deterministically: pass a timestamp far
  // past the animation start so progress clamps to 1 and settles on the value.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(performance.now() + 1e6)
    return 0
  })
})

describe('AnimatedCounter', () => {
  it('counts up to and settles on the final value', async () => {
    render(<AnimatedCounter value={42} />)
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument())
  })

  it('appends the suffix to the final value', async () => {
    render(<AnimatedCounter value={26} suffix="+" />)
    await waitFor(() => expect(screen.getByText('26+')).toBeInTheDocument())
  })
})
