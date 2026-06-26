import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use — FiTEN Business Directory',
  description: 'Terms governing use of the FiTEN Business Directory and submission of business listings.',
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
            <p>These Terms of Use govern your access to and use of the FiTEN Business Directory, operated by FiTEN (part of the Federation of Tamil Sangams of North America — FeTNA). By using this service or submitting a listing, you agree to these terms.</p>
          </section>

          <section>
            <h2>1. Purpose of the Directory</h2>
            <p>The FiTEN Business Directory is a free community resource that helps Tamil-owned and Tamil-connected businesses and professionals connect, collaborate, and grow globally. It is not a commercial marketplace and does not facilitate financial transactions.</p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>You may submit a listing if you are 16 years of age or older and are authorised to represent the business you are listing. By submitting, you confirm both conditions are met.</p>
          </section>

          <section>
            <h2>3. Listing Submissions</h2>
            <p>By submitting a business listing, you confirm that:</p>
            <ul>
              <li>All information provided is accurate, current, and not misleading</li>
              <li>You are authorised to represent the business</li>
              <li>The business operates legally in its jurisdiction</li>
              <li>You will not submit spam, duplicate, or fictitious listings</li>
              <li>Your listing does not contain offensive, defamatory, or illegal content</li>
            </ul>
            <p>FiTEN reserves the right to reject, edit, or remove any listing at its sole discretion, without notice. If your listing is removed and you believe this was in error, contact us at <strong>[privacy@fetna.org — placeholder, update before launch]</strong> to request a review.</p>
          </section>

          <section>
            <h2>4. Consent and Data Processing</h2>
            <p>By checking the consent checkbox at submission, you explicitly consent to FiTEN collecting and publicly displaying the information in your listing in accordance with our <Link href="/privacy">Privacy Policy</Link>. You may withdraw consent and request removal of your listing at any time by contacting us at <strong>[privacy@fetna.org — placeholder, update before launch]</strong>.</p>
          </section>

          <section>
            <h2>5. Public Display of Information</h2>
            <p>Information you submit — including your business name, contact email, city, and description — will be displayed publicly in the directory and may be indexed by search engines. Optional fields such as phone number and website will only be displayed if you choose to provide them. Do not submit information you do not wish to be publicly visible.</p>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>The FiTEN Business Directory, its design, code, and non-user-submitted content are the property of FiTEN / FeTNA. Business owners retain ownership of their own submitted content. You grant FiTEN a non-exclusive, royalty-free licence to display your submitted content in the directory for the duration your listing is active. You may not scrape, copy, or redistribute directory data without written permission from FiTEN.</p>
          </section>

          <section>
            <h2>7. Disclaimer</h2>
            <p>FiTEN does not endorse, verify, or guarantee any business listed in this directory. Listings are provided for informational purposes only. Users are responsible for conducting their own due diligence before engaging with any listed business. FiTEN makes no warranties — express or implied — regarding the accuracy, completeness, or reliability of any listing.</p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, FiTEN and FeTNA shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of this directory, reliance on any listing, or inability to access the service.</p>
          </section>

          <section>
            <h2>9. Governing Law</h2>
            <p>These terms are governed by the laws of the Province of Ontario, Canada, and applicable federal Canadian law, without regard to conflict of law principles. For EU users, nothing in these terms limits your rights under applicable EU consumer protection or data protection law, including GDPR.</p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>We may update these terms from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will take reasonable steps to notify users. For changes that affect how we process your personal data, we will seek fresh consent where required by applicable law. Continued use of the directory following non-material updates constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>For questions about these terms or to dispute a listing removal, contact us at <strong>[privacy@fetna.org — placeholder, update before launch]</strong> or through <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a> or <a href="https://fetna.org" target="_blank" rel="noopener noreferrer">fetna.org</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
