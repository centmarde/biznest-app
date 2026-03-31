import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listUsers } from '@/services/user-management.service'
import type { UserRow, UserStatus } from '@/views/(admin)/users/types/users-table.types'

const resolveStatus = (
  bannedUntil: string | null | undefined,
  confirmedAt: string | null | undefined,
): UserStatus => {
  if (bannedUntil && new Date(bannedUntil) > new Date()) return 'Suspended'
  if (confirmedAt) return 'Active'
  return 'Pending'
}

export const useUserManagementStore = defineStore('userManagement', () => {
  const users = ref<UserRow[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    const { users: fetchedUsers, error: fetchError } = await listUsers()

    if (fetchError) {
      error.value = fetchError
      isLoading.value = false
      return
    }

    users.value = fetchedUsers.map((user) => ({
      id: user.id,
      fullName: user.full_name ?? user.email ?? 'Unknown',
      email: user.email ?? '',
      role: user.role ?? 'user',
      status: resolveStatus(user.banned_until, user.confirmed_at),
    }))

    isLoading.value = false
  }

  return { users, isLoading, error, fetchUsers }
})
