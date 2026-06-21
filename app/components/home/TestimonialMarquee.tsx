import { testimonials } from '@/lib/testimonials'

export default function TestimonialMarquee() {
  const doubled = [...testimonials, ...testimonials]

  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <figure key={i} className="marquee-card">
            <div className="marquee-quote-mark">&ldquo;</div>
            <blockquote className="marquee-quote">{t.quote}</blockquote>
            <figcaption className="marquee-cite">
              <span>{t.author}</span>
              <span className="marquee-firm">{t.firm}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
