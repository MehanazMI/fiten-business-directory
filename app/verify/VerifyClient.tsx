'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { VerifyState } from './page'

type State = 'loading' | 'verified' | 'domain_verified' | 'already_verified' | 'expired' | 'invalid'

export default function VerifyClient() {
  const params = useSearchParams()
  const [state, setState] = useState<State>('loading')
  const [businessName, setBusinessName] = useState('')
  const [id, setId] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setState('invalid'); return }

    fetch(`/api/verify-listing?token=${token}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setState(data.error === 'expired' ? 'expired' : 'invalid')
          setBusinessName(data.businessName ?? '')
        } else {
          setBusinessName(data.businessName ?? '')
          setId(data.id ?? '')
          if (data.status === 'already_verified') setState('already_verified')
          else setState(data.domainVerified ? 'domain_verified' : 'verified')
        }
      })
      .catch(() => setState('invalid'))
  }, [params])

  if (state === 'loading') {
    return <VerifyState icon="ti-loader-2" spin title="Verifying your listing…" body="Please wait while we confirm your email." />
  }

  if (state === 'verified') {
    return (
      <VerifyState
        icon="ti-circle-check"
        title="Email verified!"
        body={`${businessName} is now live in the FiTEN Business Directory. Welcome to the community!`}
        cta={{ href: id ? `/directory/${id}` : '/directory', label: 'View My Listing' }}
      />
    )
  }

  if (state === 'domain_verified') {
    return (
      <VerifyState
        icon="ti-shield-check"
        title="Verified — domain confirmed!"
        body={`${businessName} is now live with a Verified Domain badge, showing the community your listing is authenticated.`}
        cta={{ href: id ? `/directory/${id}` : '/directory', label: 'View My Listing' }}
      />
    )
  }

  if (state === 'already_verified') {
    return (
      <VerifyState
        icon="ti-check"
        title="Already verified"
        body={`${businessName} has already been verified. Your listing is live in the directory.`}
        cta={{ href: '/directory', label: 'Browse Directory' }}
      />
    )
  }

  if (state === 'expired') {
    return (
      <VerifyState
        icon="ti-clock-x"
        title="Link expired"
        body={`The verification link for ${businessName || 'your listing'} has expired (links are valid for 48 hours). Contact us at fiten.org to request a new one.`}
        cta={{ href: '/directory', label: 'Browse Directory' }}
      />
    )
  }

  return (
    <VerifyState
      icon="ti-alert-triangle"
      title="Invalid link"
      body="This verification link is not valid. It may have already been used or may be incorrect. Contact us at fiten.org if you need help."
      cta={{ href: '/directory', label: 'Browse Directory' }}
    />
  )
}
