import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use — FiTEN Business Directory',
}

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link href="/directory" className="legal-back">← Back to Directory</Link>
          <h1>Terms of Use</h1>
          <p className="legal-date">Last updated: June 2026</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using the FiTEN Business Directory, you agree to be bound by these Terms of Use. If you do not agree, please do not use this service.</p>
          </section>

          <section>
            <h2>2. Purpose of the Directory</h2>
            <p>The FiTEN Business Directory is a community resource maintained by FiTEN (part of the FeTNA organisation) to help Tamil businesses and professionals connect, collaborate, and grow. It is provided as a free service to the global Tamil business community.</p>
          </section>

          <section>
            <h2>3. Listing Submissions</h2>
            <p>By submitting a business listing, you confirm that:</p>
            <ul>
              <li>The information provided is accurate and up to date</li>
              <li>You are authorised to represent the business</li>
              <li>The business is legitimate and complies with applicable laws</li>
              <li>You will not submit spam, duplicate, or misleading listings</li>
            </ul>
            <p>FiTEN reserves the right to remove any listing that violates these terms without notice.</p>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>
            <p>The FiTEN Business Directory, its design, and associated content are the property of FiTEN / FeTNA. Business owners retain ownership of their own submitted content. You may not scrape, copy, or redistribute directory data without written permission.</p>
          </section>

          <section>
            <h2>5. Disclaimer</h2>
            <p>FiTEN does not endorse, verify, or guarantee any business listed in this directory. Listings are provided for informational purposes only. Users are responsible for conducting their own due diligence before engaging with any listed business.</p>
          </section>

          <section>
            <h2>6. Limitation of Liability</h2>
            <p>FiTEN and FeTNA shall not be liable for any direct, indirect, or consequential damages arising from your use of this directory or reliance on any listing information.</p>
          </section>

          <section>
            <h2>7. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the directory after changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>For questions about these terms, please visit <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a> or <a href="https://fetna.org" target="_blank" rel="noopener noreferrer">fetna.org</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
