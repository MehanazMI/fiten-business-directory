import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — FiTEN Business Directory',
  description: 'How FiTEN collects, uses, and protects your data when you submit a business listing.',
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link href="/directory" className="legal-back">← Back to Directory</Link>
          <h1>Privacy Policy</h1>
          <p className="legal-date">Last updated: June 2026</p>
        </div>

        <div className="legal-body">
          <section>
            <p>This policy explains how FiTEN (part of the FeTNA organisation) collects and uses personal data when you submit a business listing to the FiTEN Business Directory. We are committed to protecting your privacy and complying with applicable data protection laws, including the EU General Data Protection Regulation (GDPR), Canada's PIPEDA, and applicable US state privacy laws.</p>
          </section>

          <section>
            <h2>1. Who We Are (Data Controller)</h2>
            <p>The FiTEN Business Directory is operated by FiTEN, part of the Federation of Tamil Sangams of North America (FeTNA). For privacy enquiries or data requests, contact us through <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a>.</p>
          </section>

          <section>
            <h2>2. What Data We Collect</h2>
            <p>When you submit a business listing, we collect:</p>
            <ul>
              <li>Business name and description</li>
              <li>Contact email address</li>
              <li>Phone number (if provided)</li>
              <li>City and region</li>
              <li>Website and logo URL (if provided)</li>
              <li>Business category and community attributes (e.g. women-led, speaker availability)</li>
              <li>Date and time of submission</li>
              <li>Your consent record (timestamp of when you agreed to these terms)</li>
            </ul>
            <p>When you use the directory or submit a form, our hosting provider (Vercel) and spam-prevention service (Google reCAPTCHA) may automatically collect your <strong>IP address</strong> and browser information as part of normal server operation and bot detection. Under GDPR, IP addresses are considered personal data. We do not store IP addresses ourselves beyond what our processors retain in their standard logs.</p>
            <p>We do not collect personal data from visitors who browse the directory without submitting.</p>
          </section>

          <section>
            <h2>3. Legal Basis for Processing (GDPR)</h2>
            <p>We process your submitted listing data on the basis of <strong>your explicit consent</strong>, given at the time of submission by checking the consent checkbox in the listing form. You may withdraw consent at any time by requesting removal of your listing (see Section 7). Withdrawal does not affect the lawfulness of processing carried out before withdrawal.</p>
            <p>IP address processing by Vercel and Google reCAPTCHA is carried out under <strong>legitimate interests</strong> (security, fraud prevention, and service delivery).</p>
          </section>

          <section>
            <h2>4. How We Use Your Data</h2>
            <p>Your submitted data is used solely to:</p>
            <ul>
              <li>Display your business listing publicly in the FiTEN directory</li>
              <li>Allow other users to contact your business</li>
              <li>Review and moderate submitted listings before publication</li>
            </ul>
            <p>We do not sell, rent, or share your data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2>5. Data Storage and Transfers</h2>
            <p>Listings are stored using Google Firebase (Firestore), hosted on Google Cloud infrastructure. Google acts as a data processor on our behalf under their Data Processing Agreement. Data may be stored and processed in data centres outside your country, including outside the EU/EEA. Google Cloud's Standard Contractual Clauses (SCCs) safeguard these transfers in accordance with GDPR Article 46. See <a href="https://cloud.google.com/terms/data-processing-addendum" target="_blank" rel="noopener noreferrer">Google Cloud DPA</a>.</p>
            <p>This site is hosted on Vercel (USA). Vercel complies with GDPR as a data processor and maintains its own DPA. See <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer">Vercel DPA</a>.</p>
          </section>

          <section>
            <h2>6. Cookies & Local Storage</h2>
            <p>We use browser local storage to remember your saved businesses (favourites) and language preference. No tracking cookies, advertising cookies, or third-party analytics are used. We use Google reCAPTCHA v3 on submission forms to prevent spam — Google's <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> applies to reCAPTCHA data, including IP address collection.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Under GDPR and applicable laws, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the data we hold about your business</li>
              <li><strong>Rectification</strong> — request correction of inaccurate data</li>
              <li><strong>Erasure ("right to be forgotten")</strong> — request deletion of your listing and all associated data</li>
              <li><strong>Restriction</strong> — request that we limit processing of your data</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Withdraw consent</strong> — at any time, without affecting the lawfulness of prior processing</li>
              <li><strong>Object</strong> — to processing based on legitimate interests</li>
              <li><strong>Lodge a complaint</strong> — with your local data protection authority (e.g. ICO in the UK, CNIL in France, DPC in Ireland)</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a>. We will respond within <strong>one month</strong> as required by GDPR Article 12.</p>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>Your listing data is retained for as long as your listing is active in the directory. If you request removal, all personal data associated with your listing will be permanently deleted within 30 days of your request being confirmed.</p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>The FiTEN Business Directory is not directed at children under 16. We do not knowingly collect data from children. If you believe a child under 16 has submitted data, contact us at <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a> and we will delete it promptly.</p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision. For material changes that affect how we process your personal data, we will take reasonable steps to notify affected users. Continued use of the directory following non-material updates constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>For any privacy-related questions or data requests, contact us through <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
