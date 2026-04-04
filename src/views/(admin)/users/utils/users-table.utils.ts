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

export const exportUsersToCsv = (rows: UserRow[]): void => {
  if (rows.length === 0) return

  const headers = ['ID', 'Username', 'Email', 'Role', 'City']
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      [
        `"${row.id}"`,
        `"${row.username.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.role}"`,
        `"${row.city.replace(/"/g, '""')}"`,
      ].join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const parseUsersCsv = async (file: File): Promise<UserRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) {
        resolve([])
        return
      }

      // Basic CSV parsing
      const lines = text.split('\n').filter((line) => line.trim().length > 0)
      if (lines.length <= 1) {
        resolve([])
        return
      }

      const rows: UserRow[] = []
      // Skip header (i=1)
      for (let i = 1; i < lines.length; i++) {
        // Simple regex to split by comma outside quotes
        const line = lines[i] || ''
        const parts = line.match(/(?:\\"|[^,])+/g)
        if (!parts || parts.length < 5) continue

        const cleanPart = (str: string) => str.replace(/^"|"$/g, '').replace(/""/g, '"').trim()

        rows.push({
          id: cleanPart(parts[0] || ''),
          username: cleanPart(parts[1] || ''),
          email: cleanPart(parts[2] || ''),
          role: cleanPart(parts[3] || ''),
          city: cleanPart(parts[4] || ''),
        })
      }
      resolve(rows)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsText(file)
  })
}
