export type StepIcon = 'map-pin' | 'sparkles' | 'handshake'

export interface StepGuideItem {
  step: string
  title: string
  description: string
  hint: string
  icon: StepIcon
}

export interface StepVisualStyle {
  iconBadge: string
  cardHover: string
}
