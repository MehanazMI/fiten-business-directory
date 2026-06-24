/**
 * One-time script: removes admin custom claim from a Firebase user by email.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=scripts/service-account.json node scripts/remove-admin-claim.mjs their@email.com
 *
 * The user must sign out and back in for the change to take effect.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/remove-admin-claim.mjs <email>')
  process.exit(1)
}

initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) })

const auth = getAuth()
const user = await auth.getUserByEmail(email)
await auth.setCustomUserClaims(user.uid, {})
console.log(`✓ admin claim removed from ${email} (uid: ${user.uid})`)
console.log('  Ask them to sign out and back in to refresh the token.')
