export type Testimonial = {
  quote: string
  author: string
  firm: string
}

/**
 * Curated community testimonials shown in the home-page marquee.
 * Static for now — the Business schema has no testimonial quotes.
 */
export const testimonials: Testimonial[] = [
  {
    quote: 'We found our SAP implementation partner through FiTEN in under a week. The verified listing made the decision easy.',
    author: 'R. Kumar',
    firm: 'Senthil Software',
  },
  {
    quote: 'Being listed connected us with two investors from the diaspora we would never have reached otherwise.',
    author: 'Anitha Devi',
    firm: 'TamilMed Clinics',
  },
  {
    quote: 'The FeTNA Sponsor badge gave new clients real confidence before our first call.',
    author: 'Vijay Ramesh',
    firm: 'ERP Partners',
  },
  {
    quote: 'A bride in Toronto found our Coimbatore showroom on FiTEN and flew in for her trousseau.',
    author: 'Lakshmi S.',
    firm: 'Lakshmi Silks',
  },
  {
    quote: 'We hired three engineers from the community through the directory. Culture fit was instant.',
    author: 'Prakash N.',
    firm: 'Cloudbridge Systems',
  },
  {
    quote: 'As a women-led firm, the visibility and the network around it have been genuinely transformative.',
    author: 'Meena R.',
    firm: 'Aruvi Consulting',
  },
  {
    quote: 'Immigration referrals used to come by word of mouth. Now they come from across three continents.',
    author: 'Suresh K.',
    firm: 'Maran Legal',
  },
  {
    quote: 'The directory paid for itself with a single partnership formed at the FeTNA convention.',
    author: 'Deepa V.',
    firm: 'Bharath Capital',
  },
]
