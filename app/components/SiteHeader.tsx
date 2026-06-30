import Image from 'next/image'
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
          <span className="hdr-logo-img">
            <Image
              src="/logos/fiten-logo.png"
              alt="FiTEN — FeTNA International Tamil Entrepreneur Network"
              width={110}
              height={38}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </span>
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
