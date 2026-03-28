export type AdminSidebarIconName =
  | 'dashboard'
  | 'map'
  | 'report'
  | 'analytics'
  | 'users'
  | 'roles'
  | 'notifications'
  | 'settings'

export interface AdminNavItem {
  label: string
  to: string
  icon: AdminSidebarIconName
}
