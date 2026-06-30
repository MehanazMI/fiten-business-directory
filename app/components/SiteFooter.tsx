import Image from 'next/image'

export default function SiteFooter() {
  return (
    <footer className="dir-footer">
      <div className="dir-footer-grid">
        <div>
          <div className="dir-footer-brand-logos">
            <Image
              src="/logos/fiten-logo.png"
              alt="FiTEN — FeTNA International Tamil Entrepreneur Network"
              width={120}
              height={48}
              style={{ objectFit: 'contain' }}
            />
            <Image
              src="/logos/fetna-logo-Edited.png"
              alt="FeTNA — Federation of Tamil Sangams, North America"
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p className="dir-footer-tagline">
            The official Tamil business directory of FeTNA — connecting professionals, partners, and investors across the global Tamil community.
          </p>
          <div className="dir-footer-org-links">
            <a href="https://fiten.org" target="_blank" rel="noopener noreferrer" className="dir-footer-org-link">fiten.org ↗</a>
            <a href="https://fetna.org" target="_blank" rel="noopener noreferrer" className="dir-footer-org-link">fetna.org ↗</a>
          </div>
        </div>
        <div>
          <div className="dir-footer-col-title">Directory</div>
          <ul className="dir-footer-links">
            <li><a href="/directory">Browse Businesses</a></li>
            <li><a href="/form">Add Your Business</a></li>
          </ul>
        </div>
        <div>
          <div className="dir-footer-col-title">Organization</div>
          <ul className="dir-footer-links">
            <li><a href="https://fetna.org" target="_blank" rel="noopener noreferrer">FeTNA</a></li>
            <li><a href="https://fiten.org" target="_blank" rel="noopener noreferrer">FiTEN Global</a></li>
          </ul>
        </div>
        <div>
          <div className="dir-footer-col-title">Share Feedback</div>
          <p className="dir-footer-tagline" style={{ marginBottom: '8px' }}>Tell us what you need. We&rsquo;re building this with the community.</p>
          <a href="mailto:rasheed.comm@gmail.com?subject=FiTEN Network Feedback" className="dir-footer-feedback-link">
            Share your feedback →
          </a>
        </div>
      </div>
      <hr className="dir-footer-divider" />
      <p className="dir-footer-copy">© 2026 FiTEN · Official directory of FeTNA · <a href="https://fetna.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>fetna.org</a> · <a href="/privacy" style={{ color: 'inherit' }}>Privacy</a> · <a href="/terms" style={{ color: 'inherit' }}>Terms</a></p>
    </footer>
  )
}
