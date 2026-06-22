import MobileNav from './MobileNav'

interface SiteHeaderProps {
  page?: 'form'
  activeLink?: 'home' | 'directory' | 'connect' | 'form'
}

export default function SiteHeader({ page, activeLink }: SiteHeaderProps = {}) {
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
        <a className={`nav-link${activeLink === 'home' ? ' active' : ''}`} href="/">Home</a>
        <a className={`nav-link${activeLink === 'directory' ? ' active' : ''}`} href="/directory">Directory</a>
        <a className={`nav-link${activeLink === 'connect' ? ' active' : ''}`} href="/connect">Connect</a>
        <a className={`nav-link${activeLink === 'form' ? ' active' : ''}`} href="/form">Get Listed</a>
      </nav>

      <div className="hdr-right">
        {page === 'form' ? (
          <a className="nav-link hdr-right-link" href="/directory" style={{ color: 'rgba(255,255,255,0.7)' }}>
            View Directory
          </a>
        ) : (
          <a className="hdr-btn" href="/form">Get Listed</a>
        )}
        <MobileNav activeLink={activeLink} />
      </div>
    </header>
  )
}
