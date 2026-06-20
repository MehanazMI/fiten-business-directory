import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchBusinesses, fetchBusinessById } from '@/lib/firestore-rest'
import { colors, textColors, oppLabels, sigClass } from '@/lib/utils'
import { SITE_URL } from '@/lib/site'
import type { Business } from '@/types/business'

function businessJsonLd(b: Business) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/directory/${b.id}`,
    name: b.businessName,
    ...(b.nameTamil && { alternateName: b.nameTamil }),
    description: b.description,
    ...(b.website && { url: b.website }),
    ...(b.city && { address: { '@type': 'PostalAddress', addressLocality: b.city } }),
    ...(b.pro && b.reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: b.rating,
        reviewCount: b.reviews,
      },
    }),
  }
}

export const revalidate = 3600

export async function generateStaticParams() {
  const businesses = await fetchBusinesses()
  return businesses.map(b => ({ id: b.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const business = await fetchBusinessById(id)
  if (!business) return { title: 'Business Not Found' }
  return {
    title: business.businessName,
    description: business.description?.slice(0, 155),
    alternates: { canonical: `/directory/${business.id}` },
    openGraph: {
      title: business.businessName,
      description: business.description?.slice(0, 155),
      url: `/directory/${business.id}`,
    },
  }
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const b = await fetchBusinessById(id)
  if (!b) notFound()

  const bg = colors[b.colorIdx]
  const fg = textColors[b.colorIdx]

  return (
    <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1.5rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(b)) }}
      />
      <a href="/directory" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Back to Directory
      </a>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {b.pro && (
          <div className="pro-banner">★ PRO Member</div>
        )}

        <div className="detail-header">
          <div className="detail-avatar-lg" style={{ background: bg, color: fg }}>
            {b.initials}
          </div>
          <div>
            <div className="detail-name">{b.businessName}</div>
            {b.nameTamil && <div className="detail-name-sub">{b.nameTamil}</div>}
            <div className="detail-cat-loc">{b.category} · 📍 {b.city}{b.founded ? ` · Est. ${b.founded}` : ''}</div>
          </div>
        </div>

        <div className="detail-body" style={{ maxHeight: 'none' }}>
          <div className="detail-sec">About</div>
          <div className="detail-desc">{b.description}</div>

          {b.website && (
            <div className="detail-info-row">
              <span className="detail-icon">🌐</span>
              <a href={b.website} target="_blank" rel="noopener noreferrer">{b.website}</a>
            </div>
          )}

          {(b.looking.length > 0 || b.speaker || b.women) && (
            <>
              <div className="detail-sec">B2B Signals</div>
              <div className="b2b-signals" style={{ padding: 0, marginBottom: '0.8rem' }}>
                {b.looking.map(l => (
                  <span key={l} className={`b2b-signal ${sigClass[l]}`}>{oppLabels[l]}</span>
                ))}
                {b.speaker && <span className="b2b-signal sig-speaker">🎤 Speaker</span>}
                {b.women && <span className="b2b-signal sig-women">♀ Women-Led</span>}
                {b.convention && <span className="b2b-signal sig-convention">🎉 FeTNA Conv.</span>}
              </div>
            </>
          )}

          {b.pro && b.reviews > 0 && (
            <>
              <div className="detail-sec">Reviews</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text2)' }}>
                <span className="rating-stars">
                  {Array.from({ length: 5 }, (_, i) => (i < Math.round(b.rating) ? '★' : '☆')).join('')}
                </span>
                {' '}<strong>{b.rating}</strong> ({b.reviews} reviews)
              </div>
            </>
          )}
        </div>

        <div className="detail-footer">
          <a href="/directory" className="detail-connect-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
            View All Businesses
          </a>
        </div>
      </div>
    </div>
  )
}
