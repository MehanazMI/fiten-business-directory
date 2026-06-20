const PINS = [
  { x: 24, y: 42, city: 'San Francisco' },
  { x: 28, y: 44, city: 'Silicon Valley' },
  { x: 32, y: 46, city: 'Dallas' },
  { x: 36, y: 38, city: 'Toronto' },
  { x: 40, y: 42, city: 'Edison NJ' },
  { x: 41, y: 42, city: 'Jersey City' },
  { x: 38, y: 46, city: 'Houston' },
  { x: 67, y: 58, city: 'Chennai' },
  { x: 66, y: 60, city: 'Coimbatore' },
  { x: 78, y: 65, city: 'Singapore' },
  { x: 62, y: 53, city: 'Dubai' },
  { x: 51, y: 37, city: 'London' },
]

export default function WorldMap({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const dotFill = theme === 'light' ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.22)'
  return (
    <div className="worldmap">
      <svg viewBox="0 0 100 50" className="worldmap-svg" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="wm-dots" x="0" y="0" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
            <circle cx="0.6" cy="0.6" r="0.22" fill={dotFill} />
          </pattern>
          <mask id="wm-mask">
            <rect width="100" height="50" fill="black" />
            <ellipse cx="22" cy="20" rx="13" ry="9" fill="white" />
            <ellipse cx="30" cy="38" rx="8" ry="9" fill="white" />
            <ellipse cx="50" cy="22" rx="6" ry="6" fill="white" />
            <ellipse cx="55" cy="38" rx="6" ry="9" fill="white" />
            <ellipse cx="68" cy="22" rx="10" ry="7" fill="white" />
            <ellipse cx="70" cy="40" rx="6" ry="5" fill="white" />
            <ellipse cx="82" cy="35" rx="6" ry="6" fill="white" />
            <ellipse cx="86" cy="14" rx="9" ry="6" fill="white" />
          </mask>
        </defs>
        <rect width="100" height="50" fill="url(#wm-dots)" mask="url(#wm-mask)" />
      </svg>

      {PINS.map((p, i) => (
        <div key={p.city} className="worldmap-pin-wrap" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="worldmap-pin">
            <span className="worldmap-pin-pulse" style={{ animationDelay: `${i * 180}ms` }} />
            <span className="worldmap-pin-dot" />
          </div>
          <div className="worldmap-pin-label">{p.city}</div>
        </div>
      ))}
    </div>
  )
}
