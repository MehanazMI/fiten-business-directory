import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from './firebase-admin'

export const adminAuth = getAuth(getAdminApp())
