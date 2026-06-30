import MobileNav from './MobileNav'
import AuthButton from './AuthButton'

interface SiteHeaderProps {
  activeLink?: 'home' | 'directory' | 'connect' | 'events' | 'form'
}

export default function SiteHeader({ activeLink }: SiteHeaderProps = {}) {
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
        <a className={`nav-link${activeLink === 'events' ? ' active' : ''}`} href="/events">Events</a>
        <a className={`nav-link${activeLink === 'form' ? ' active' : ''}`} href="/form">Get Listed</a>
      </nav>

      <div className="hdr-right">
        {activeLink !== 'form' && <a className="hdr-btn" href="/form">Get Listed</a>}
        <AuthButton />
        <MobileNav activeLink={activeLink} />
      </div>
    </header>
  )
}
