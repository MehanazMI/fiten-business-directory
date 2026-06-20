export default function SiteHeader({ page }: { page?: 'form' } = {}) {
  return (
    <header className="site-header">
      <div className="logo-area">
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'inherit' }}>
          <span className="logo-text">
            <span className="logo-fi">Fi</span>
            <span className="logo-ten">TEN</span>
          </span>
          <span className="logo-divider" aria-hidden="true" />
          <span className="logo-tag">Business Directory</span>
        </a>
      </div>

      <div className="hdr-right">
        {page === 'form' ? (
          <a className="nav-link" href="/directory" style={{ color: 'rgba(255,255,255,0.7)' }}>
            View Directory
          </a>
        ) : (
          <a className="hdr-btn" href="/form">Add Your Business</a>
        )}
      </div>
    </header>
  )
}
