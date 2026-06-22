import type { Business } from '@/types/business'

// Single source of truth for how a business's category and B2B signals are
// presented across the card, the in-app modal, and the static detail page.

export const CAT_ICON: Record<string, string> = {
  'Healthcare':      'ti-stethoscope',
  'Tech':            'ti-device-laptop',
  'Technology':      'ti-device-laptop',
  'Education':       'ti-school',
  'Legal':           'ti-scale',
  'Food':            'ti-tools-kitchen-2',
  'Food & Beverage': 'ti-tools-kitchen-2',
  'Finance':         'ti-coin',
  'Real Estate':     'ti-home',
  'Retail':          'ti-shopping-cart',
  'Entertainment':   'ti-music',
  'Services':        'ti-tool',
}

export const CAT_COLOR: Record<string, string> = {
  'Healthcare':      '#993556',
  'Tech':            '#185FA5',
  'Technology':      '#185FA5',
  'Education':       '#3B6D11',
  'Legal':           '#3C3489',
  'Food':            '#854F0B',
  'Food & Beverage': '#854F0B',
  'Finance':         '#0F6E56',
  'Real Estate':     '#185FA5',
  'Retail':          '#993556',
  'Entertainment':   '#3C3489',
  'Services':        '#0F6E56',
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

const LOOKING_META: Record<string, SignalMeta> = {
  partner: { icon: 'ti-heart-handshake', label: 'Partner',            color: '#7C3AED' },
  client:  { icon: 'ti-users',           label: 'Seeking clients',    color: '#059669' },
  invest:  { icon: 'ti-chart-line',      label: 'Seeking investment', color: '#C5A059' },
  hire:    { icon: 'ti-briefcase',       label: 'Hiring',             color: '#2563EB' },
}

export function buildSignals(
  b: Business,
  opts: { includePro?: boolean; includeConvention?: boolean } = {}
): SignalMeta[] {
  return [
    ...(opts.includePro && b.pro
      ? [{ icon: 'ti-rosette', label: 'FeTNA Sponsor', color: '#C5A059' }]
      : []),
    ...b.looking.map(l => LOOKING_META[l]).filter(Boolean),
    ...(b.women   ? [{ icon: 'ti-gender-female', label: 'Women-led', color: '#D4537E' }] : []),
    ...(b.speaker ? [{ icon: 'ti-microphone',    label: 'Speaker',   color: '#0284C7' }] : []),
    ...(opts.includeConvention && b.convention
      ? [{ icon: 'ti-confetti', label: 'FeTNA Convention', color: '#BA7517' }]
      : []),
  ]
}
