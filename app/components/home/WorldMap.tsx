'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Graticule, Marker } from 'react-simple-maps'
import countries from 'world-atlas/countries-110m.json'

const DEFAULT_PINS: { coords: [number, number]; city: string }[] = [
  { coords: [-122.4, 37.8], city: 'San Francisco' },
  { coords: [-121.9, 37.4], city: 'Silicon Valley' },
  { coords: [-96.8,  32.8], city: 'Dallas' },
  { coords: [-79.4,  43.7], city: 'Toronto' },
  { coords: [-74.4,  40.5], city: 'Edison NJ' },
  { coords: [-74.1,  40.7], city: 'Jersey City' },
  { coords: [-95.4,  29.8], city: 'Houston' },
  { coords: [ 80.3,  13.1], city: 'Chennai' },
  { coords: [ 77.0,  11.0], city: 'Coimbatore' },
  { coords: [103.8,   1.4], city: 'Singapore' },
  { coords: [ 55.3,  25.3], city: 'Dubai' },
  { coords: [ -0.1,  51.5], city: 'London' },
]

export default function WorldMap({
  theme = 'dark',
  pins,
}: {
  theme?: 'dark' | 'light'
  pins?: { coords: [number, number]; city: string }[]
}) {
  const PINS = pins?.length ? pins : DEFAULT_PINS
  const isDark = theme === 'dark'
  const landFill   = isDark ? '#213d61' : '#c8d6e5'
  const landHover  = isDark ? '#2c5183' : '#a8c4d8'
  const landStroke = isDark ? 'rgba(197,160,89,0.28)' : 'rgba(15,23,42,0.20)'
  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'
  const pinColor   = '#C5A059'

  const [tooltip, setTooltip] = useState<{ city: string; x: number; y: number } | null>(null)

  return (
    <div className="worldmap" style={{ position: 'relative' }}>
      <ComposableMap
        projection="geoEquirectangular"
        projectionConfig={{ scale: 185, center: [15, 25] }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Graticule stroke={gridStroke} strokeWidth={0.4} />

        <Geographies geography={countries}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={landFill}
                stroke={landStroke}
                strokeWidth={0.4}
                style={{
                  default: { outline: 'none' },
                  hover:   { outline: 'none', fill: landHover },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {PINS.map((pin, i) => (
          <Marker
            key={pin.city}
            coordinates={pin.coords}
            onMouseEnter={(e: React.MouseEvent) => {
              const g = (e.target as SVGElement).closest('g')
              const svg = (e.target as SVGElement).closest('svg')
              if (!g || !svg) return
              const svgRect = svg.getBoundingClientRect()
              const gRect = g.getBoundingClientRect()
              setTooltip({
                city: pin.city,
                x: gRect.left - svgRect.left + gRect.width / 2,
                y: gRect.top  - svgRect.top,
              })
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <circle r={11} fill="transparent" style={{ cursor: 'pointer' }} />
            <circle r={7} fill={pinColor} opacity={0.18} style={{ pointerEvents: 'none' }} />
            <circle
              r={5}
              fill="none"
              stroke={pinColor}
              strokeWidth={1}
              opacity={0.6}
              style={{ animation: `rsm-pulse 2.2s ease-out ${i * 220}ms infinite`, pointerEvents: 'none' }}
            />
            <circle r={3} fill="#E8C77E" style={{ pointerEvents: 'none' }} />
            <circle r={1.2} fill="#FFF3DA" style={{ pointerEvents: 'none' }} />
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y - 36,
          transform: 'translateX(-50%)',
          background: isDark ? 'rgba(10,18,35,0.95)' : 'rgba(255,255,255,0.95)',
          border: `1px solid ${isDark ? 'rgba(197,160,89,0.5)' : 'rgba(15,23,42,0.2)'}`,
          color: isDark ? '#C5A059' : '#0f172a',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.04em',
          padding: '4px 10px',
          borderRadius: '4px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}>
          {tooltip.city}
        </div>
      )}

      <style>{`
        @keyframes rsm-pulse {
          0%   { r: 4;  opacity: 0.7; }
          100% { r: 13; opacity: 0;   }
        }
      `}</style>
    </div>
  )
}
