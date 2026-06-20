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

      <nav className="nav-hdr">
        <a className="nav-link" href="/directory">Directory</a>
        <a className="nav-link" href="/directory#categories">Categories</a>
        <a className="nav-link" href="/form">For Partners</a>
      </nav>

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
