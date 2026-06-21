export type Region = 'Americas' | 'Asia' | 'Europe / GCC'

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

function normalize(city: string): string {
  return city.split(',')[0].trim()
}

export function cityGeo(city: string): GeoEntry | undefined {
  return GEO[city] ?? GEO[normalize(city)]
}

export function deriveGeoStats(cities: string[]) {
  const continents = new Set<string>()
  const regionMap = new Map<string, number>()
  const pinMap = new Map<string, [number, number]>()

  for (const city of cities) {
    const geo = cityGeo(city)
    if (!geo) continue
    continents.add(geo.continent)
    regionMap.set(geo.region, (regionMap.get(geo.region) ?? 0) + 1)
    const key = normalize(city)
    if (!pinMap.has(key)) pinMap.set(key, geo.coords)
  }

  const regions = [...regionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([l, n]) => ({ l, n }))

  const pins = [...pinMap.entries()].map(([city, coords]) => ({ city, coords }))

  return { continents: continents.size, regions, pins }
}
