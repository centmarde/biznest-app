import navigatuLogo from '@/assets/images/navigatu.jpg'
import csuLogo from '@/assets/images/csu.png'

interface Partner {
  name: string
  logoUrl: string
}

export const partners: Partner[] = [
  { name: 'Navigatu TBI', logoUrl: navigatuLogo },
  { name: 'Caraga State University', logoUrl: csuLogo },
]
