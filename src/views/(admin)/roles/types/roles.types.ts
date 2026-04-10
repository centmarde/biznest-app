import type { AdminNavItem } from '@/types/admin-sidebar.types'

export type RoleStatus = 'active' | 'inactive'

export interface RoleRow {
  id: string
  title: string
  description: string
}

export interface CreateRolePayload {
  title: string
  description: string
}

export interface RolePage {
  id: string
  pages: string
  role_id: string
}

export interface RoleCounts {
  total: number
  active: number
  system: number
}

export interface RolesHeaderProps {
  searchQuery: string
  totalRolesCount: number
  activeRolesCount: number
  systemRolesCount: number
}

export interface RolesCardsProps {
  roles: RoleRow[]
  isLoading?: boolean
}

export interface RolesModalProps {
  isOpen: boolean
}

export interface PermissionModalProps {
  isOpen: boolean
  role: RoleRow | null
  pages: AdminNavItem[]
  selectedPages: string[]
  isLoading?: boolean
  isSaving?: boolean
}

export interface PermissionPageGroup {
  title: string
  items: AdminNavItem[]
}

export type RolePermissionsMap = Record<string, string[]>
