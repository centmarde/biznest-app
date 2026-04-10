import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchRoles, createRole, deleteRole } from '@/services/roles.service'
import type { RoleRow, CreateRolePayload } from '@/views/(admin)/roles/types/roles.types'
import { useAlertContext } from '@/composables/useAlert'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleRow[]>([])
  const isLoading = ref(false)
  const rolesError = ref<string | null>(null)
  const hasLoadedRoles = ref(false)
  let activeLoadRequestId = 0
  let inFlightLoadRoles: Promise<void> | null = null

  const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : 'An error occurred'
  }

  const getAlert = () => {
    try {
      return useAlertContext()
    } catch {
      return null
    }
  }

  const loadRoles = async (options: { force?: boolean } = {}): Promise<void> => {
    const { force = false } = options

    if (inFlightLoadRoles && !force) {
      return inFlightLoadRoles
    }

    if (hasLoadedRoles.value && !force) {
      return
    }

    const requestId = ++activeLoadRequestId
    rolesError.value = null
    isLoading.value = true

    const request = (async () => {
      try {
        const fetchedRoles = await fetchRoles()

        // Ignore stale responses when a newer request already started.
        if (requestId !== activeLoadRequestId) {
          return
        }

        roles.value = fetchedRoles
        hasLoadedRoles.value = true
      } catch (error: unknown) {
        // Ignore stale failures from superseded requests.
        if (requestId !== activeLoadRequestId) {
          return
        }

        roles.value = []
        rolesError.value = getErrorMessage(error)

        getAlert()?.showAlert({
          title: 'Error loading roles',
          description: rolesError.value,
          tone: 'destructive',
        })
      } finally {
        if (requestId === activeLoadRequestId) {
          isLoading.value = false
        }
      }
    })()

    inFlightLoadRoles = request

    try {
      await request
    } finally {
      if (inFlightLoadRoles === request) {
        inFlightLoadRoles = null
      }
    }
  }

  const addRole = async (payload: CreateRolePayload) => {
    isLoading.value = true
    try {
      const newRole = await createRole(payload)
      roles.value.push(newRole)
      getAlert()?.showAlert({
        title: 'Success',
        description: 'Role created successfully',
        tone: 'success',
      })
      return newRole
    } catch (error: unknown) {
      getAlert()?.showAlert({
        title: 'Error creating role',
        description: getErrorMessage(error),
        tone: 'destructive',
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const removeRole = async (id: string) => {
    isLoading.value = true
    try {
      await deleteRole(id)
      roles.value = roles.value.filter((role) => role.id !== id)
      getAlert()?.showAlert({
        title: 'Success',
        description: 'Role deleted successfully',
        tone: 'success',
      })
    } catch (error: unknown) {
      getAlert()?.showAlert({
        title: 'Error deleting role',
        description: getErrorMessage(error),
        tone: 'destructive',
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    roles,
    isLoading,
    rolesError,
    loadRoles,
    addRole,
    removeRole,
  }
})
