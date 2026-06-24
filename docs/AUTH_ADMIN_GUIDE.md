# Auth & Admin Guide

## How Sign-In Works

FiTEN uses **Firebase Authentication with Google Sign-In**. Users sign in with their Google account — no password needed.

### What happens when someone signs in

1. User clicks **Sign in** in the header
2. A Google popup appears — they pick their Google account
3. Firebase creates (or finds) a user record keyed to their email
4. The site checks their Firebase ID token for an `admin: true` custom claim
5. If the claim exists → they can access `/admin`
6. If it doesn't → they can only access `/dashboard` (their own listing)

### What `/dashboard` gives any signed-in user

- Edit their own listing: description, website, phone, category, B2B signals
- Only works if their Google account email matches the `email` field on a business document

---

## Making Someone an Admin

### Prerequisites

You need a Firebase service account key. Download it once and keep it safe:

1. Go to [Firebase Console](https://console.firebase.google.com) → **fiten-business-directory**
2. Click the gear icon → **Project Settings** → **Service accounts** tab
3. Click **Generate new private key** → save as `scripts/service-account.json` in the project root
4. This file is gitignored — never commit it

### Steps

**1. The user must sign in first** (creates their Firebase user record)

Ask them to go to `https://fiten-business-directory.vercel.app` and click Sign in with their Google account. They only need to do this once.

**2. Run the admin claim script**

```bash
# From the project root in Git Bash / Terminal
GOOGLE_APPLICATION_CREDENTIALS=scripts/service-account.json node scripts/set-admin-claim.mjs their@email.com
```

You should see:
```
✓ admin claim set on their@email.com (uid: xxxxxxxxxx)
  Sign out and back in to refresh the token.
```

**3. Ask them to sign out and back in**

Custom claims are embedded in the ID token, which is cached for 1 hour. They must sign out and sign back in so the new token includes the `admin: true` claim.

**4. Verify**

They go to `/admin` — if they see the dashboard, it worked.

---

## Removing Admin Access

**1. Run the script with an empty claims object**

```bash
# From the project root
GOOGLE_APPLICATION_CREDENTIALS=scripts/service-account.json node scripts/remove-admin-claim.mjs their@email.com
```

> **Note:** The `remove-admin-claim.mjs` script is shown below — create it once if needed.

**Or do it directly with Node:**

```bash
# One-liner (replace email)
GOOGLE_APPLICATION_CREDENTIALS=scripts/service-account.json node -e "
import('@firebase/app').then(async () => {
  const { initializeApp, cert } = await import('firebase-admin/app')
  const { getAuth } = await import('firebase-admin/auth')
  initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) })
  const user = await getAuth().getUserByEmail('their@email.com')
  await getAuth().setCustomUserClaims(user.uid, {})
  console.log('Admin claim removed.')
})
"
```

**Or use the Firebase Console:**

1. Firebase Console → **Authentication** → **Users** tab
2. Find the user by email → click the 3-dot menu → **Edit user**
3. There's no UI for custom claims — you must use the script or Admin SDK

**2. Ask them to sign out and back in**

Same as granting — the token cache must refresh. After they sign back in, `/admin` will show "Access denied".

---

## Creating the remove-admin script (optional convenience)

Save this as `scripts/remove-admin-claim.mjs`:

```js
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
console.log(`✓ admin claim removed from ${email}`)
console.log('  Ask them to sign out and back in.')
```

---

## Current Admins

| Email | Added |
|-------|-------|
| rasheed.comm@gmail.com | June 2026 |

Update this table whenever you grant or revoke admin access.

---

## Firestore Rules Summary

| Action | Who can do it |
|--------|--------------|
| Read businesses | Anyone |
| Create business | Anyone (status must be `pending`) |
| Update own listing | Signed-in user whose email matches the listing |
| Update any listing | Admin only |
| Delete listing | Admin only |
| Approve / toggle PRO / verify | Admin only (via `/admin` dashboard) |
| Create/read claims | Anyone can create; admin can read |
| Read/write events | Anyone can read; organizer or admin can edit/delete |
