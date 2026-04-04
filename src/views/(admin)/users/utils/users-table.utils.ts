import type {
  UserRoleCounts,
  UserRoleFilter,
  UserRow,
} from '@/views/(admin)/users/types/users-table.types'

export const normalizeUserText = (value: string): string => value.trim().toLowerCase()

export const filterUserRows = (
  rows: UserRow[],
  searchQuery: string,
  roleFilter: UserRoleFilter,
): UserRow[] => {
  const normalizedQuery = normalizeUserText(searchQuery)

  return rows.filter((row) => {
    const normalizedRole = normalizeUserText(row.role)
    const matchesRole = roleFilter === 'all' || normalizedRole === roleFilter

    const matchesQuery =
      !normalizedQuery ||
      normalizeUserText(row.id).includes(normalizedQuery) ||
      normalizeUserText(row.username).includes(normalizedQuery) ||
      normalizeUserText(row.email).includes(normalizedQuery)

    return matchesRole && matchesQuery
  })
}

export const getUserRoleCounts = (rows: UserRow[]): UserRoleCounts => {
  return rows.reduce<UserRoleCounts>(
    (acc, row) => {
      const normalizedRole = normalizeUserText(row.role)

      if (normalizedRole === 'user') {
        acc.users += 1
      } else if (normalizedRole === 'admin') {
        acc.admin += 1
      } else if (normalizedRole === 'superadmin') {
        acc.superadmin += 1
      }

      return acc
    },
    {
      users: 0,
      admin: 0,
      superadmin: 0,
    },
  )
}

export const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
  const normalizedRole = normalizeUserText(role)
  switch (normalizedRole) {
    case 'superadmin':
      return 'destructive'
    case 'admin':
      return 'default'
    case 'user':
    default:
      return 'secondary'
  }
}
