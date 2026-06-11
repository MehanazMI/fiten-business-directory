import type { Metadata } from 'next'
import AddBusinessStandalone from './AddBusinessStandalone'

export const metadata: Metadata = {
  title: 'Add Your Business',
  description: 'List your Tamil-owned business on the FiTEN Business Directory. Free listing, live immediately.',
  alternates: { canonical: '/form' },
}

export default function FormPage() {
  return <AddBusinessStandalone />
}
