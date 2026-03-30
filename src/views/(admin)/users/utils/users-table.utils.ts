import type { UserStatus } from '@/views/(admin)/users/types/users-table.types'

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
}
