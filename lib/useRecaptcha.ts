'use client'

import { useEffect } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY || document.getElementById('recaptcha-script')) return
    const script = document.createElement('script')
    script.id = 'recaptcha-script'
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  async function getToken(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!SITE_KEY) return reject(new Error('reCAPTCHA site key not set'))
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject)
      })
    })
  }

  return { getToken }
}

// Extend window type for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
