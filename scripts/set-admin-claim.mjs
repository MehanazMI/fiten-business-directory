/**
 * One-time script: sets { admin: true } custom claim on a Firebase user by email.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin-claim.mjs rasheed.comm@gmail.com
 *
 * Requirements:
 *   1. Download a Firebase service account key from:
 *      Firebase Console → Project Settings → Service accounts → Generate new private key
 *   2. Save it as service-account.json in the project root (gitignored)
 *   3. Run the command above — then sign out and back in so the token refreshes
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <email>')
  process.exit(1)
}

initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) })

const auth = getAuth()
const user = await auth.getUserByEmail(email)
await auth.setCustomUserClaims(user.uid, { admin: true })
console.log(`✓ admin claim set on ${email} (uid: ${user.uid})`)
console.log('  Sign out and back in to refresh the token.')
