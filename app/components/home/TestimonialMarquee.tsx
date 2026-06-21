import { testimonials as fallback } from '@/lib/testimonials'
import type { Testimonial } from '@/lib/firestore-rest'

export default function TestimonialMarquee({ testimonials }: { testimonials?: Testimonial[] }) {
  const items = testimonials?.length ? testimonials : fallback
  const doubled = [...items, ...items]

  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((t: { quote: string; author: string; firm: string }, i: number) => (
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
