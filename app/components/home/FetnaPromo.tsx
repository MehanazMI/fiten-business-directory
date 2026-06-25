import Image from 'next/image'

export default function FetnaPromo() {
  return (
    <section className="fetna-promo">
      <div className="fetna-promo-grid" aria-hidden="true" />
      <div className="fetna-promo-inner">
        <div className="fetna-promo-logos">
          <Image
            src="/logos/fiten-logo.png"
            alt="FiTEN — FeTNA International Tamil Entrepreneur Network"
            width={120}
            height={48}
            className="fetna-promo-fiten-logo"
          />
          <div className="fetna-promo-logo-divider" aria-hidden="true" />
          <Image
            src="/logos/fetna-convention.png"
            alt="FeTNA 39th Tamil Convention 2026"
            width={52}
            height={52}
            className="fetna-promo-fetna-logo"
          />
        </div>

        <div className="fetna-promo-pill">
          <span className="fetna-promo-pill-dot" aria-hidden="true" />
          Presenting at FeTNA 39th Tamil Convention · New Jersey
        </div>

        <h2 className="fetna-promo-title">
          Meet us at <em>FeTNA 2026</em>
        </h2>
        <p className="fetna-promo-text">
          Visit the FiTEN booth at the 39th Tamil Convention in New Jersey — explore the directory live,
          list your business on the spot, and connect with Tamil entrepreneurs from around the globe.
        </p>

        <div className="fetna-promo-stats">
          <div className="fetna-promo-stat">
            <span className="fetna-promo-stat-num">Jul 2–4</span>
            <span className="fetna-promo-stat-label">2026</span>
          </div>
          <div className="fetna-promo-stat-divider" aria-hidden="true" />
          <div className="fetna-promo-stat">
            <span className="fetna-promo-stat-num">New Jersey</span>
            <span className="fetna-promo-stat-label">Convention Center</span>
          </div>
          <div className="fetna-promo-stat-divider" aria-hidden="true" />
          <div className="fetna-promo-stat">
            <span className="fetna-promo-stat-num">Free</span>
            <span className="fetna-promo-stat-label">To list & browse</span>
          </div>
        </div>

        <div className="fetna-promo-cta">
          <a href="/form" className="home-btn-gold">
            List Your Business Free
          </a>
          <a href="/directory" className="home-btn-ghost">
            Explore the Directory
          </a>
        </div>
      </div>
    </section>
  )
}
