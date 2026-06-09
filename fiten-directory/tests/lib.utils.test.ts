import { describe, it, expect } from 'vitest'
import { stableColorIdx, colors, textColors, categoryMap, oppLabels, sigClass, i18n } from '@/lib/utils'

describe('stableColorIdx', () => {
  it('returns a value in the valid index range', () => {
    expect(stableColorIdx('abc')).toBeGreaterThanOrEqual(0)
    expect(stableColorIdx('abc')).toBeLessThan(colors.length)
  })

  it('is deterministic — same id always returns same index', () => {
    expect(stableColorIdx('biz-001')).toBe(stableColorIdx('biz-001'))
  })

  it('produces different indices for different ids', () => {
    const results = new Set(['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota'].map(stableColorIdx))
    expect(results.size).toBeGreaterThan(1)
  })

  it('handles empty string without throwing', () => {
    expect(() => stableColorIdx('')).not.toThrow()
  })

  it('handles very long ids', () => {
    const longId = 'x'.repeat(10000)
    expect(() => stableColorIdx(longId)).not.toThrow()
    const idx = stableColorIdx(longId)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(colors.length)
  })

  it('colors and textColors arrays have matching length', () => {
    expect(colors.length).toBe(textColors.length)
  })
})

describe('categoryMap', () => {
  it('maps known categories to short display names', () => {
    expect(categoryMap['Food & Beverage']).toBe('Food')
    expect(categoryMap['Technology']).toBe('Tech')
    expect(categoryMap['Finance & Insurance']).toBe('Finance')
  })

  it('maps all 12 expected categories', () => {
    const expected = [
      'Food & Beverage', 'Retail', 'Technology', 'Healthcare',
      'Finance', 'Finance & Insurance', 'Education', 'Real Estate',
      'Services', 'Entertainment', 'Legal', 'Other',
    ]
    expected.forEach(cat => expect(categoryMap).toHaveProperty(cat))
  })

  it('returns undefined for unknown categories (caller handles fallback)', () => {
    expect(categoryMap['Unknown Category']).toBeUndefined()
  })
})

describe('oppLabels', () => {
  it('has entries for all four opportunity types', () => {
    expect(oppLabels.partner).toBeTruthy()
    expect(oppLabels.client).toBeTruthy()
    expect(oppLabels.invest).toBeTruthy()
    expect(oppLabels.hire).toBeTruthy()
  })
})

describe('sigClass', () => {
  it('maps all four opportunity types to CSS class strings', () => {
    expect(sigClass.partner).toBe('sig-partner')
    expect(sigClass.client).toBe('sig-client')
    expect(sigClass.invest).toBe('sig-invest')
    expect(sigClass.hire).toBe('sig-hire')
  })
})

describe('i18n', () => {
  it('has English and Tamil keys', () => {
    expect(i18n.en).toBeDefined()
    expect(i18n.ta).toBeDefined()
  })

  it('both locales have the same set of keys', () => {
    expect(Object.keys(i18n.en).sort()).toEqual(Object.keys(i18n.ta).sort())
  })

  it('English strings are non-empty', () => {
    Object.values(i18n.en).forEach(v => expect(v.length).toBeGreaterThan(0))
  })

  it('Tamil strings are non-empty', () => {
    Object.values(i18n.ta).forEach(v => expect(v.length).toBeGreaterThan(0))
  })
})
