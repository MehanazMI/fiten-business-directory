'use client'

import { signInWithRedirect, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase-client'
import { useAuth } from '@/lib/auth-context'

export default function AuthButton() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return (
      <div className="auth-user-area">
        <a href="/dashboard" className="auth-user-btn" title="My Dashboard">
          {user.photoURL
            ? <img src={user.photoURL} alt={user.displayName ?? 'Account'} className="auth-avatar" referrerPolicy="no-referrer" />
            : <span className="auth-avatar auth-avatar-initials">{(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}</span>
          }
        </a>
        <button
          className="auth-signout-btn"
          onClick={() => signOut(auth)}
          title="Sign out"
        >
          <i className="ti ti-logout" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <button
      className="auth-signin-btn"
      onClick={() => signInWithRedirect(auth, googleProvider)}
    >
      <i className="ti ti-brand-google" aria-hidden="true" />
      Sign in
    </button>
  )
}
