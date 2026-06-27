import type { Business } from '@/types/business'

export const CAT_ICON: Record<string, string> = {
  'Healthcare':         'ti-stethoscope',
  'Tech':               'ti-device-laptop',
  'Technology':         'ti-device-laptop',
  'Education':          'ti-school',
  'Legal':              'ti-scale',
  'Food':               'ti-tools-kitchen-2',
  'Food & Beverage':    'ti-tools-kitchen-2',
  'Finance':            'ti-coin',
  'Finance & Insurance':'ti-coin',
  'Real Estate':        'ti-home',
  'Retail':             'ti-shopping-cart',
  'Entertainment':      'ti-music',
  'Marketing':          'ti-speakerphone',
  'Logistics':          'ti-truck',
  'Human Resources':    'ti-users',
  'Agriculture':        'ti-plant',
  'Services':           'ti-tool',
}

export const CAT_COLOR: Record<string, string> = {
  'Healthcare':         '#993556',
  'Tech':               '#185FA5',
  'Technology':         '#185FA5',
  'Education':          '#3B6D11',
  'Legal':              '#3C3489',
  'Food':               '#854F0B',
  'Food & Beverage':    '#854F0B',
  'Finance':            '#0F6E56',
  'Finance & Insurance':'#0F6E56',
  'Real Estate':        '#185FA5',
  'Retail':             '#993556',
  'Entertainment':      '#3C3489',
  'Marketing':          '#7C3AED',
  'Logistics':          '#854F0B',
  'Human Resources':    '#0F6E56',
  'Agriculture':        '#3B6D11',
  'Services':           '#0F6E56',
}

export function categoryIcon(category: string): string {
  return CAT_ICON[category] ?? 'ti-building'
}

export function categoryColor(category: string): string {
  return CAT_COLOR[category] ?? 'var(--navy)'
}

export interface SignalMeta {
  icon: string
  label: string
  color: string
}

// B2B signals — what the business is actively looking for
export const B2B_META: Record<string, SignalMeta> = {
  partner: { icon: 'ti-heart-handshake', label: 'Open to Partnerships', color: '#7C3AED' },
  client:  { icon: 'ti-users',           label: 'Seeking Clients',      color: '#059669' },
  invest:  { icon: 'ti-chart-line',      label: 'Seeking Investment',   color: '#C5A059' },
  hire:    { icon: 'ti-briefcase',       label: 'Hiring Now',           color: '#2563EB' },
  mentor:  { icon: 'ti-user-star',       label: 'Open to Mentoring',    color: '#0284C7' },
}

// Community badges — what the business is
export const COMMUNITY_META: Record<string, SignalMeta> = {
  women:      { icon: 'ti-gender-female', label: 'Women-Led',                color: '#D4537E' },
  speaker:    { icon: 'ti-microphone',    label: 'Available as Speaker',     color: '#7C3AED' },
  nonprofit:  { icon: 'ti-heart',         label: 'Non-Profit / Social',      color: '#E11D48' },
  convention: { icon: 'ti-confetti',      label: 'FeTNA Convention',         color: '#BA7517' },
}

export function buildB2BSignals(b: Business): SignalMeta[] {
  return b.looking.map(l => B2B_META[l]).filter(Boolean)
}

export function buildCommunityBadges(b: Business, opts: { includePro?: boolean } = {}): SignalMeta[] {
  return [
    ...(opts.includePro && b.pro ? [{ icon: 'ti-rosette', label: 'FeTNA Sponsor', color: '#C5A059' }] : []),
    ...(b.women     ? [COMMUNITY_META.women]      : []),
    ...(b.nonprofit ? [COMMUNITY_META.nonprofit]  : []),
    ...(b.speaker   ? [COMMUNITY_META.speaker]    : []),
    ...(b.convention? [COMMUNITY_META.convention] : []),
  ]
}

// Legacy — kept for any callers that haven't migrated yet
export function buildSignals(
  b: Business,
  opts: { includePro?: boolean; includeConvention?: boolean } = {}
): SignalMeta[] {
  return [
    ...buildB2BSignals(b),
    ...buildCommunityBadges(b, { includePro: opts.includePro }),
  ]
}
