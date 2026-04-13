import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAlertContext } from '@/composables/useAlert'
import { deleteUserById, fetchAllUsers, updateUserProfile } from '@/services/users.service'
import type { UserRoleFilter, UserRow } from '@/views/(admin)/users/types/users-table.types'
import {
  exportUsersToCsv,
  filterUserRows,
  getUserRoleCounts,
  parseUsersCsv,
} from '@/views/(admin)/users/utils/users-table.utils'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const useUsersStore = defineStore('users', () => {
  const rows = ref<UserRow[]>([])
  const isLoadingUsers = ref(false)
  const usersError = ref<string | null>(null)
  const hasLoadedUsers = ref(false)
  const searchQuery = ref('')
  const roleFilter = ref<UserRoleFilter>('all')
  const addUserModalOpen = ref(false)
  let activeLoadRequestId = 0
  let inFlightLoadUsers: Promise<void> | null = null

  const getAlert = () => {
    try {
      return useAlertContext()
    } catch {
      return null
    }
  }

  const filteredRows = computed<UserRow[]>(() =>
    filterUserRows(rows.value, searchQuery.value, roleFilter.value),
  )

  const roleCounts = computed(() => getUserRoleCounts(rows.value))

  const loadUsers = async (options: { force?: boolean } = {}): Promise<void> => {
    const { force = false } = options

    if (inFlightLoadUsers && !force) {
      return inFlightLoadUsers
    }

    if (hasLoadedUsers.value && !force) {
      return
    }

    const requestId = ++activeLoadRequestId
    usersError.value = null
    isLoadingUsers.value = true

    const request = (async () => {
      try {
        const fetchedRows = await fetchAllUsers()

        // Ignore stale responses when a newer request already started.
        if (requestId !== activeLoadRequestId) {
          return
        }

        rows.value = fetchedRows
        hasLoadedUsers.value = true
      } catch (error: unknown) {
        // Ignore stale failures from superseded requests.
        if (requestId !== activeLoadRequestId) {
          return
        }

        rows.value = []
        const message = getErrorMessage(error, 'Unable to load users right now.')
        usersError.value = message

        getAlert()?.showAlert({
          title: 'Error loading users',
          description: message,
          tone: 'destructive',
        })
      } finally {
        if (requestId === activeLoadRequestId) {
          isLoadingUsers.value = false
        }
      }
    })()

    inFlightLoadUsers = request

    try {
      await request
    } finally {
      if (inFlightLoadUsers === request) {
        inFlightLoadUsers = null
      }
    }
  }

  const setSearchQuery = (value: string): void => {
    searchQuery.value = value
  }

  const setRoleFilter = (value: UserRoleFilter): void => {
    roleFilter.value = value
  }

  const setAddUserModalOpen = (isOpen: boolean): void => {
    addUserModalOpen.value = isOpen
  }

  const upsertUser = (updatedUser: UserRow): void => {
    const index = rows.value.findIndex((row) => row.id === updatedUser.id)

    if (index >= 0) {
      rows.value[index] = updatedUser
      return
    }

    rows.value.push(updatedUser)
  }

  const removeUserLocally = (id: string): void => {
    rows.value = rows.value.filter((row) => row.id !== id)
  }

  const updateUser = async (
    userId: string,
    updates: { username?: string; role?: string; city?: string; cityId?: string },
  ): Promise<void> => {
    try {
      await updateUserProfile(userId, updates)

      const existingUser = rows.value.find((row) => row.id === userId)
      if (existingUser) {
        upsertUser({
          ...existingUser,
          username: updates.username ?? existingUser.username,
          role: updates.role ?? existingUser.role,
          city: updates.city ?? existingUser.city,
          cityId: updates.cityId ?? existingUser.cityId,
        })
      }

      getAlert()?.showAlert({
        title: 'Success',
        description: 'User profile updated successfully.',
        tone: 'success',
      })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to update user profile.')

      getAlert()?.showAlert({
        title: 'Update Failed',
        description: message,
        tone: 'destructive',
      })

      throw error
    }
  }

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await deleteUserById(id)
      removeUserLocally(id)

      getAlert()?.showAlert({
        title: 'Success',
        description: 'User deleted successfully.',
        tone: 'success',
      })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to delete user.')

      getAlert()?.showAlert({
        title: 'Delete Failed',
        description: message,
        tone: 'destructive',
      })

      throw error
    }
  }

  const exportFilteredRowsToCsv = (): void => {
    exportUsersToCsv(filteredRows.value)
  }

  const importUsersFromCsv = async (file: File): Promise<number> => {
    const parsedRows = await parseUsersCsv(file)

    if (parsedRows.length === 0) {
      return 0
    }

    const existingIds = new Set(rows.value.map((row) => row.id))
    const uniqueRows = parsedRows.filter((row) => !existingIds.has(row.id))

    if (uniqueRows.length > 0) {
      rows.value = [...rows.value, ...uniqueRows]
    }

    return uniqueRows.length
  }

  return {
    rows,
    isLoadingUsers,
    usersError,
    searchQuery,
    roleFilter,
    addUserModalOpen,
    filteredRows,
    roleCounts,
    loadUsers,
    setSearchQuery,
    setRoleFilter,
    setAddUserModalOpen,
    upsertUser,
    removeUserLocally,
    updateUser,
    deleteUser,
    exportFilteredRowsToCsv,
    importUsersFromCsv,
  }
})
