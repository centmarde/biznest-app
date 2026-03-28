export type FooterContactIcon = 'mail' | 'map-pin' | 'clock-3'

export interface FooterQuickLink {
  label: string
  to: string
}

export interface FooterLegalLink {
  label: string
  href: string
}

export interface FooterContactItem {
  label: string
  icon: FooterContactIcon
  href?: string
}
