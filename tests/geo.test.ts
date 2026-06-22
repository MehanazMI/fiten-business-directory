import { describe, it, expect } from 'vitest'
import { cityGeo, deriveGeoStats } from '@/lib/geo'

describe('cityGeo', () => {
  it('resolves an exact known city', () => {
    expect(cityGeo('Toronto')?.region).toBe('Americas')
  })

  it('resolves a known city with a trailing qualifier', () => {
    expect(cityGeo('Edison, NJ')?.region).toBe('Americas')
  })

  it('falls back to country bucket for an unmapped city', () => {
    const geo = cityGeo('Mumbai, India')
    expect(geo?.continent).toBe('Asia')
    expect(geo?.region).toBe('Asia')
  })

  it('falls back for GCC cities via country keyword', () => {
    expect(cityGeo('Some Town, UAE')?.region).toBe('Europe / GCC')
  })

  it('maps Australia to the Asia Pacific region', () => {
    expect(cityGeo('Melbourne, Australia')?.region).toBe('Asia Pacific')
  })

  it('returns undefined for a truly unknown location', () => {
    expect(cityGeo('Atlantis')).toBeUndefined()
  })
})

describe('deriveGeoStats', () => {
  it('counts unmapped-but-country-known cities toward continents and regions', () => {
    const { continents, regions } = deriveGeoStats(['Toronto', 'Mumbai, India', 'Melbourne, Australia'])
    expect(continents).toBe(3) // North America, Asia, Oceania
    const labels = regions.map(r => r.l)
    expect(labels).toContain('Americas')
    expect(labels).toContain('Asia')
    expect(labels).toContain('Asia Pacific')
  })

  it('dedupes pins that share a country centroid', () => {
    // Two different unmapped Indian cities resolve to the same centroid → one pin.
    const { pins } = deriveGeoStats(['Mumbai, India', 'Pune, India'])
    expect(pins.length).toBe(1)
  })

  it('ignores locations it cannot place at all', () => {
    const { continents, regions, pins } = deriveGeoStats(['Atlantis'])
    expect(continents).toBe(0)
    expect(regions.length).toBe(0)
    expect(pins.length).toBe(0)
  })
})
