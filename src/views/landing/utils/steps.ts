import type { StepGuideItem, StepIcon, StepVisualStyle } from '../types/steps.types'

export const stepGuideItems: StepGuideItem[] = [
  {
    step: 'Step 01',
    title: 'Tell BizNest What You Are Building',
    description:
      'Share your business type, budget range, and ideal customer profile in under 2 minutes.',
    hint: 'No spreadsheets, no manual research needed.',
    icon: 'map-pin',
  },
  {
    step: 'Step 02',
    title: 'Review AI-Ranked Location Matches',
    description:
      'Get a clear shortlist of high-potential areas scored by demand, competition, and growth signals.',
    hint: 'Focus on the top opportunities first.',
    icon: 'sparkles',
  },
  {
    step: 'Step 03',
    title: 'Launch Faster With Local Connections',
    description:
      'Connect with nearby businesses and partners to accelerate your opening and reduce launch friction.',
    hint: 'Move from idea to opening with confidence.',
    icon: 'handshake',
  },
]

export const stepVisualMap: Record<StepIcon, StepVisualStyle> = {
  'map-pin': {
    iconBadge:
      'border-secondary/40 bg-secondary/15 text-secondary group-hover:bg-secondary/25 group-hover:text-secondary',
    cardHover: 'hover:border-secondary/55 hover:shadow-lg hover:shadow-secondary/25',
  },
  sparkles: {
    iconBadge:
      'border-accent/40 bg-accent/15 text-accent group-hover:bg-accent/25 group-hover:text-accent',
    cardHover: 'hover:border-accent/55 hover:shadow-lg hover:shadow-accent/25',
  },
  handshake: {
    iconBadge:
      'border-success/35 bg-success/15 text-success group-hover:bg-success/25 group-hover:text-success',
    cardHover: 'hover:border-success/50 hover:shadow-lg hover:shadow-success/20',
  },
}
