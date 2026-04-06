import type { RoleRow, RoleCounts } from '@/views/(admin)/roles/types/roles.types'

export const getRoleCounts = (rows: RoleRow[]): RoleCounts => {
  const total = rows.length
  const active = rows.filter((row) => row.status === 'active').length
  const system = rows.filter((row) => row.isSystem).length

  return { total, active, system }
}

export const filterRoleRows = (rows: RoleRow[], searchQuery: string): RoleRow[] => {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  if (!normalizedQuery) {
    return rows
  }

  return rows.filter((row) => {
    return (
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.description.toLowerCase().includes(normalizedQuery) ||
      row.id.toLowerCase().includes(normalizedQuery)
    )
  })
}
