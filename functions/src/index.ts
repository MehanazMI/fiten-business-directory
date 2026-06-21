import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as https from 'https'
import * as http from 'http'

initializeApp()

// Free/personal email providers — domain match against these is meaningless
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.in',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'rediffmail.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'zoho.com',
])

function emailDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@')
  return parts.length === 2 ? parts[1] : null
}

function websiteDomain(website: string): string | null {
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return url.hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

function checkReachable(website: string): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      const lib = url.protocol === 'https:' ? https : http
      const req = lib.request(
        {
          method: 'HEAD',
          hostname: url.hostname,
          path: url.pathname || '/',
          port: url.port || undefined,
          timeout: 6000,
          headers: { 'User-Agent': 'FiTEN-Verify/1.0' },
        },
        res => {
          const code = res.statusCode ?? 0
          // Accept any response that isn't a server error (4xx client errors still mean the site is up)
          resolve(code > 0 && code < 500)
        }
      )
      req.on('error', () => resolve(false))
      req.on('timeout', () => { req.destroy(); resolve(false) })
      req.end()
    } catch {
      resolve(false)
    }
  })
}

export const verifyBusiness = onDocumentCreated(
  { document: 'businesses/{businessId}', timeoutSeconds: 15 },
  async event => {
    const data = event.data?.data()
    if (!data) return

    const db = getFirestore()
    const ref = db.collection('businesses').doc(event.params.businessId)

    const email: string = (data['email'] ?? '').toLowerCase().trim()
    const website: string = (data['website'] ?? '').trim()

    const setPending = () => ref.update({ verified: false, verificationStatus: 'pending' })

    // Need both email and website to auto-verify
    if (!email || !website) return setPending()

    const eDomain = emailDomain(email)
    if (!eDomain) return setPending()

    // Skip free email providers — domain match is meaningless
    if (FREE_EMAIL_DOMAINS.has(eDomain)) return setPending()

    const wDomain = websiteDomain(website)
    if (!wDomain) return setPending()

    // Core check: email domain must match website domain
    if (eDomain !== wDomain) return setPending()

    // Secondary check: website must be reachable
    const reachable = await checkReachable(website)
    if (!reachable) return setPending()

    await ref.update({ verified: true, verificationStatus: 'auto' })
    console.log(`Auto-verified: ${event.params.businessId} (${eDomain})`)
  }
)
