import type {
  UserRoleCounts,
  UserRoleFilter,
  UserRow,
  UserStatus,
} from '@/views/(admin)/users/types/users-table.types'

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
}

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
      normalizeUserText(row.fullName).includes(normalizedQuery) ||
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
