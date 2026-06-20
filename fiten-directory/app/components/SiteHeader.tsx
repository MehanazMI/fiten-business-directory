export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="logo-area">
        <a href="/directory" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'inherit' }}>
          <span className="logo-text">
            <span className="logo-fi">Fi</span>
            <span className="logo-ten">TEN</span>
          </span>
          <span className="logo-divider" aria-hidden="true" />
          <span className="logo-tag">Business Directory</span>
        </a>
      </div>

      <div className="hdr-right">
        <a className="hdr-btn" href="/form">
          Add Your Business
        </a>
      </div>
    </header>
  )
}
