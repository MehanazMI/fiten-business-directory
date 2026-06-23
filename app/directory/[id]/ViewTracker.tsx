'use client'
import { useEffect } from 'react'
import { incrementViews } from '@/lib/firestore-rest'

export default function ViewTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    incrementViews(businessId).catch(() => {})
  }, [businessId])
  return null
}
