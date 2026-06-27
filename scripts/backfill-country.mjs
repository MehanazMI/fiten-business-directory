/**
 * One-time migration: write `country` onto every business document that lacks it,
 * derived from the existing `region` field.
 *
 * Usage:
 *   node scripts/backfill-country.mjs          # dry-run (prints what would change)
 *   node scripts/backfill-country.mjs --write  # apply changes to Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

const DRY_RUN = !process.argv.includes('--write')

// Load service account — expects GOOGLE_APPLICATION_CREDENTIALS or a local file
let app
try {
  app = initializeApp({ credential: cert(JSON.parse(readFileSync('./service-account.json', 'utf8'))) })
} catch {
  // Fall back to application default credentials (works on Cloud Shell / CI)
  app = initializeApp()
}

const db = getFirestore(app)

function deriveCountry(region = '') {
  const r = region.toLowerCase()
  if (/canada|toronto|vancouver|montreal|ottawa|calgary|edmonton/.test(r)) return 'Canada'
  if (/\busa\b|new york|new jersey|california|texas|illinois|massachusetts|georgia|washington|pennsylvania|florida/.test(r)) return 'USA'
  if (/\bindia\b|chennai|coimbatore|madurai|bengaluru|mumbai|delhi/.test(r)) return 'India'
  if (/\buk\b|united kingdom|england|london/.test(r)) return 'UK'
  if (/singapore/.test(r)) return 'Singapore'
  if (/australia/.test(r)) return 'Australia'
  if (/middle east|uae|dubai/.test(r)) return 'UAE'
  if (/germany|france|europe/.test(r)) return 'Europe'
  if (/malaysia/.test(r)) return 'Malaysia'
  if (/sri lanka/.test(r)) return 'Sri Lanka'
  return null
}

async function main() {
  const snap = await db.collection('businesses').get()
  console.log(`Found ${snap.size} documents\n`)

  const batch = db.batch()
  let updateCount = 0
  let skipCount = 0

  for (const doc of snap.docs) {
    const data = doc.data()

    if (data.country) {
      console.log(`  SKIP  ${doc.id}  ${data.businessName} — already has country: ${data.country}`)
      skipCount++
      continue
    }

    const country = deriveCountry(data.region)
    if (!country) {
      console.log(`  WARN  ${doc.id}  ${data.businessName} — cannot derive country from region: "${data.region}"`)
      continue
    }

    console.log(`  SET   ${doc.id}  ${data.businessName}  →  country: "${country}"  (region: "${data.region}")`)
    batch.update(doc.ref, { country })
    updateCount++
  }

  console.log(`\n${updateCount} to update, ${skipCount} already set`)

  if (DRY_RUN) {
    console.log('\nDry run — no changes written. Run with --write to apply.')
  } else {
    await batch.commit()
    console.log('\nDone — Firestore updated.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
