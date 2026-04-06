export type RoleStatus = 'active' | 'inactive'

export interface RoleRow {
  id: string
  title: string
  description: string
}

export interface RoleCounts {
  total: number
  active: number
  system: number
}
