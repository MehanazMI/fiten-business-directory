import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchBusinesses, fetchBusinessById } from '@/lib/firestore-rest'
import { categoryIcon, categoryColor, buildB2BSignals, buildCommunityBadges } from '@/lib/business-meta'
import { SITE_URL } from '@/lib/site'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import ConnectionRequestForm from './ConnectionRequestForm'
import ViewTracker from './ViewTracker'
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

const CONNECT_MSG = (name: string) =>
  `Hi ${name}, I found you on FiTEN Directory and would like to connect.`

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const b = await fetchBusinessById(id)
  if (!b) notFound()

  const icon = categoryIcon(b.category)
  const iconColor = categoryColor(b.category)
  const b2bSignals = buildB2BSignals(b)
  const communityBadges = buildCommunityBadges(b, { includePro: true })

  const connectHref = b.phone
    ? `https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(CONNECT_MSG(b.businessName))}`
    : `mailto:${b.email}?subject=${encodeURIComponent('FiTEN Directory – Connection Request')}&body=${encodeURIComponent(CONNECT_MSG(b.businessName))}`

  return (
    <>
      <ViewTracker businessId={b.id} />
      <SiteHeader activeLink="directory" />
      <div className="biz-detail-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(b)) }}
        />

        <a href="/directory" className="biz-detail-back">
          <i className="ti ti-arrow-left" aria-hidden="true" /> Back to Directory
        </a>

        <article className="biz-detail-card">
          <div className="biz-detail-header">
            <div className="biz-detail-avatar">
              {b.logoUrl
                ? <img src={b.logoUrl} alt={b.businessName} className="card-logo-img" />
                : <i className={`ti ${icon}`} style={{ color: iconColor }} aria-hidden="true" />}
            </div>
            <div className="biz-detail-head-text">
              <h1 className="biz-detail-name">{b.businessName}</h1>
              {b.nameTamil && <div className="biz-detail-name-ta">{b.nameTamil}</div>}
              <div className="biz-detail-meta">
                <span>{b.category}</span>
                {b.city && <><span className="meta-dot">·</span><i className="ti ti-map-pin" aria-hidden="true" /><span>{b.city}{b.country ? `, ${b.country}` : ''}</span></>}
              </div>
              {(b.pro || b.verified) && (
                <div className="biz-detail-badges">
                  {b.pro && <span className="pro-badge"><i className="ti ti-rosette" /> FeTNA Sponsor</span>}
                  {b.verified && <span className="verified-badge"><i className="ti ti-circle-check" /> Verified</span>}
                </div>
              )}
            </div>
          </div>

          <div className="biz-detail-body">
            <div className="biz-detail-sec">About</div>
            <p className="biz-detail-desc">{b.description}</p>

            {b.services && b.services.length > 0 && (
              <>
                <div className="biz-detail-sec">What we do</div>
                <div className="detail-services">
                  {b.services.map(s => <span key={s} className="detail-svc-chip">{s}</span>)}
                </div>
              </>
            )}

            <div className="biz-detail-sec">Contact</div>
            <div className="biz-detail-contact">
              <div className="biz-detail-contact-row">
                <i className="ti ti-mail" aria-hidden="true" />
                <a href={`mailto:${b.email}`}>{b.email}</a>
              </div>
              {b.phone && (
                <div className="biz-detail-contact-row">
                  <i className="ti ti-phone" aria-hidden="true" />
                  <a href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a>
                </div>
              )}
              {b.website && (
                <div className="biz-detail-contact-row">
                  <i className="ti ti-world" aria-hidden="true" />
                  <a href={b.website} target="_blank" rel="noopener noreferrer">
                    {b.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {b.views > 0 && (
              <div className="biz-detail-stat">
                <i className="ti ti-eye" aria-hidden="true" />
                <span>{b.views} visits</span>
              </div>
            )}

            {b2bSignals.length > 0 && (
              <>
                <div className="biz-detail-sec">Looking for</div>
                <div className="b2b-signals">
                  {b2bSignals.map((s, i) => (
                    <span key={s.label} className="b2b-signal">
                      {i > 0 && <span className="sig-sep">·</span>}
                      <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </>
            )}

            {communityBadges.length > 0 && (
              <>
                <div className="biz-detail-sec">Community</div>
                <div className="b2b-signals">
                  {communityBadges.map((s, i) => (
                    <span key={s.label} className="b2b-signal">
                      {i > 0 && <span className="sig-sep">·</span>}
                      <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </>
            )}

          </div>

          {b.looking.length > 0 && (
            <ConnectionRequestForm
              businessId={b.id}
              businessName={b.businessName}
              looking={b.looking}
            />
          )}

          <div className="biz-detail-footer">
            <a className="biz-detail-btn" href={connectHref} target={b.phone ? '_blank' : undefined} rel={b.phone ? 'noopener noreferrer' : undefined}>
              <i className={`ti ${b.phone ? 'ti-brand-whatsapp' : 'ti-mail'}`} aria-hidden="true" />
              {b.phone ? 'Message on WhatsApp' : 'Email this business'}
            </a>
            <a className="biz-detail-btn-ghost" href="/directory">
              Browse Directory
            </a>
          </div>
        </article>
      </div>
      <SiteFooter />
    </>
  )
}
