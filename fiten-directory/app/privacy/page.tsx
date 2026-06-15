import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — FiTEN Business Directory',
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
            <h2>1. Information We Collect</h2>
            <p>When you submit a business listing through the FiTEN Business Directory, we collect the information you provide, including business name, contact details, location, and business description. We do not collect personal data from visitors who browse the directory.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>The information submitted is used solely to create and display your business listing in the FiTEN directory. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2>3. Data Storage</h2>
            <p>Business listings are stored securely using Google Firebase (Firestore). Data is retained as long as your listing remains active. You may request removal of your listing at any time by contacting us.</p>
          </section>

          <section>
            <h2>4. Cookies & Local Storage</h2>
            <p>We use browser local storage to remember your saved businesses (favourites) and language preference. No tracking cookies or third-party analytics cookies are used.</p>
          </section>

          <section>
            <h2>5. Third-Party Services</h2>
            <p>This site is hosted on Vercel and uses Google Firebase for data storage. These services have their own privacy policies. We do not integrate advertising networks or social media trackers.</p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>If you have submitted a business listing and wish to update or remove it, please contact FiTEN at the email address provided on <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a>. We will process your request within 14 days.</p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>For privacy-related questions, please reach out through <a href="https://fiten.org" target="_blank" rel="noopener noreferrer">fiten.org</a> or <a href="https://fetna.org" target="_blank" rel="noopener noreferrer">fetna.org</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
