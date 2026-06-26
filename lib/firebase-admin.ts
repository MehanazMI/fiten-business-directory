import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const strip = (s?: string) => s?.replace(/^﻿/, '').trim()
  const privateKey = strip(process.env.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: strip(process.env.FIREBASE_ADMIN_PROJECT_ID),
      clientEmail: strip(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      privateKey,
    }),
  })
}

export const adminDb = getFirestore(getAdminApp())
