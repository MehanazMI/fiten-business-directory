export type Region = 'Americas' | 'Asia' | 'Europe / GCC' | 'Asia Pacific'

interface GeoEntry {
  continent: string
  region: Region
  coords: [number, number]
}

const GEO: Record<string, GeoEntry> = {
  'San Francisco':  { continent: 'North America', region: 'Americas',     coords: [-122.4,  37.8] },
  'Silicon Valley': { continent: 'North America', region: 'Americas',     coords: [-121.9,  37.4] },
  'Dallas':         { continent: 'North America', region: 'Americas',     coords: [  -96.8,  32.8] },
  'San Jose':       { continent: 'North America', region: 'Americas',     coords: [-121.9,  37.3] },
  'Toronto':        { continent: 'North America', region: 'Americas',     coords: [  -79.4,  43.7] },
  'Edison':         { continent: 'North America', region: 'Americas',     coords: [  -74.4,  40.5] },
  'Jersey City':    { continent: 'North America', region: 'Americas',     coords: [  -74.1,  40.7] },
  'Houston':        { continent: 'North America', region: 'Americas',     coords: [  -95.4,  29.8] },
  'Chennai':        { continent: 'Asia',          region: 'Asia',         coords: [   80.3,  13.1] },
  'Coimbatore':     { continent: 'Asia',          region: 'Asia',         coords: [   77.0,  11.0] },
  'Singapore':      { continent: 'Asia',          region: 'Asia',         coords: [  103.8,   1.4] },
  'Dubai':          { continent: 'Asia',          region: 'Europe / GCC', coords: [   55.3,  25.3] },
  'London':         { continent: 'Europe',        region: 'Europe / GCC', coords: [   -0.1,  51.5] },
}

// Tier-2 fallback: free-text cities we don't have an exact entry for are bucketed by
// country/region keyword to an approximate national centroid. Keeps the headline,
// continents count, and region boxes consistent instead of silently dropping the city.
const COUNTRY: { match: string[]; geo: GeoEntry }[] = [
  { match: ['india'],                                              geo: { continent: 'Asia',          region: 'Asia',         coords: [ 78.9,  20.6] } },
  { match: ['sri lanka', 'srilanka'],                              geo: { continent: 'Asia',          region: 'Asia',         coords: [ 80.7,   7.9] } },
  { match: ['singapore'],                                          geo: { continent: 'Asia',          region: 'Asia',         coords: [103.8,   1.4] } },
  { match: ['malaysia'],                                           geo: { continent: 'Asia',          region: 'Asia',         coords: [101.9,   4.2] } },
  { match: ['united arab emirates', 'uae', 'dubai', 'abu dhabi'],  geo: { continent: 'Asia',          region: 'Europe / GCC', coords: [ 54.0,  24.0] } },
  { match: ['qatar'],                                              geo: { continent: 'Asia',          region: 'Europe / GCC', coords: [ 51.2,  25.3] } },
  { match: ['saudi'],                                              geo: { continent: 'Asia',          region: 'Europe / GCC', coords: [ 45.0,  24.0] } },
  { match: ['kuwait'],                                             geo: { continent: 'Asia',          region: 'Europe / GCC', coords: [ 47.5,  29.3] } },
  { match: ['oman'],                                               geo: { continent: 'Asia',          region: 'Europe / GCC', coords: [ 56.0,  21.5] } },
  { match: ['united kingdom', 'england', 'scotland', 'britain'],   geo: { continent: 'Europe',        region: 'Europe / GCC', coords: [ -1.5,  52.4] } },
  { match: ['france'],                                             geo: { continent: 'Europe',        region: 'Europe / GCC', coords: [  2.2,  46.2] } },
  { match: ['germany'],                                            geo: { continent: 'Europe',        region: 'Europe / GCC', coords: [ 10.4,  51.2] } },
  { match: ['switzerland'],                                        geo: { continent: 'Europe',        region: 'Europe / GCC', coords: [  8.2,  46.8] } },
  { match: ['canada'],                                             geo: { continent: 'North America', region: 'Americas',     coords: [-106.3,  56.1] } },
  { match: ['united states', 'usa', 'u.s.a', 'u.s.'],              geo: { continent: 'North America', region: 'Americas',     coords: [ -98.6,  39.8] } },
  { match: ['australia'],                                          geo: { continent: 'Oceania',       region: 'Asia Pacific', coords: [133.8, -25.3] } },
  { match: ['new zealand'],                                        geo: { continent: 'Oceania',       region: 'Asia Pacific', coords: [174.8, -41.0] } },
]

function normalize(city: string): string {
  return city.split(',')[0].trim()
}

export function cityGeo(city: string): GeoEntry | undefined {
  const exact = GEO[city] ?? GEO[normalize(city)]
  if (exact) return exact

  const haystack = ` ${city.toLowerCase()} `
  for (const { match, geo } of COUNTRY) {
    if (match.some(m => haystack.includes(m))) return geo
  }
  return undefined
}

export function deriveGeoStats(cities: string[]) {
  const continents = new Set<string>()
  const regionMap = new Map<string, number>()
  const pinMap = new Map<string, { city: string; coords: [number, number] }>()

  for (const city of cities) {
    const geo = cityGeo(city)
    if (!geo) continue
    continents.add(geo.continent)
    regionMap.set(geo.region, (regionMap.get(geo.region) ?? 0) + 1)
    // Dedupe pins by coordinate so multiple cities sharing a country centroid don't stack.
    const key = `${geo.coords[0]},${geo.coords[1]}`
    if (!pinMap.has(key)) pinMap.set(key, { city: normalize(city), coords: geo.coords })
  }

  const regions = [...regionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([l, n]) => ({ l, n }))

  const pins = [...pinMap.values()]

  return { continents: continents.size, regions, pins }
}
