import type { UserRow, UserStatus } from '@/views/(admin)/users/types/users-table.types'

export const USER_ROWS: UserRow[] = [
  {
    id: 'U-001',
    fullName: 'Ava Reynolds',
    email: 'ava.reynolds@biznest.app',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'U-002',
    fullName: 'Noah Patel',
    email: 'noah.patel@biznest.app',
    role: 'Manager',
    status: 'Pending',
  },
  {
    id: 'U-003',
    fullName: 'Mila Santos',
    email: 'mila.santos@biznest.app',
    role: 'Staff',
    status: 'Suspended',
  },
]

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
}
