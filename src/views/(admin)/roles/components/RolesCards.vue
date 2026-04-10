<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-vue-next'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import PermissionModal from '@/views/(admin)/roles/components/PermissionModal.vue'
import type {
  RolePermissionsMap,
  RoleRow,
  RolesCardsProps,
} from '@/views/(admin)/roles/types/roles.types'
import type { AdminNavItem } from '@/types/admin-sidebar.types'
import { getRoleBadgeVariant } from '@/utils/roles.utils'
import { managementAdminNavItems, primaryAdminNavItems } from '@/utils/admin-sidebar-nav'
import { deleteRole, fetchRolePagePaths, replaceRolePagePaths } from '@/services/roles.service'
import { useAlertContext } from '@/composables/useAlert'
import {
  getSelectedPagesForRole,
  togglePermissionPage,
} from '@/views/(admin)/roles/utils/roles.utils'

const props = withDefaults(defineProps<RolesCardsProps>(), {
  isLoading: false,
})

const emit = defineEmits<{
  (e: 'deleted', id: string): void
}>()

const { showAlert } = useAlertContext()
const permissionPages: AdminNavItem[] = [...primaryAdminNavItems, ...managementAdminNavItems]

const isModalOpen = ref(false)
const roleToDelete = ref<RoleRow | null>(null)
const isPermissionModalOpen = ref(false)
const roleToConfigure = ref<RoleRow | null>(null)
const rolePermissions = ref<RolePermissionsMap>({})
const isPermissionLoading = ref(false)
const isPermissionSaving = ref(false)

const openDeleteModal = (role: RoleRow) => {
  roleToDelete.value = role
  isModalOpen.value = true
}

const handleDeleteAction = async () => {
  if (!roleToDelete.value) return

  await deleteRole(roleToDelete.value.id)
  emit('deleted', roleToDelete.value.id)
  showAlert({
    title: 'Success',
    description: 'Role deleted successfully.',
    tone: 'success',
  })
}

const selectedPermissionPages = computed<string[]>(() => {
  return getSelectedPagesForRole(rolePermissions.value, roleToConfigure.value?.id)
})

const openPermissionModal = async (role: RoleRow): Promise<void> => {
  roleToConfigure.value = role

  isPermissionModalOpen.value = true

  isPermissionLoading.value = true

  try {
    const savedPermissions = await fetchRolePagePaths(role.id)
    rolePermissions.value = {
      ...rolePermissions.value,
      [role.id]: savedPermissions,
    }
  } catch (error) {
    showAlert({
      title: 'Failed to Load Permissions',
      description: error instanceof Error ? error.message : 'Unable to load role permissions.',
      tone: 'destructive',
    })
  } finally {
    isPermissionLoading.value = false
  }
}

const togglePermission = (pagePath: string, checked: boolean): void => {
  const roleId = roleToConfigure.value?.id

  if (!roleId) {
    return
  }

  rolePermissions.value = {
    ...rolePermissions.value,
    [roleId]: togglePermissionPage(rolePermissions.value[roleId] ?? [], pagePath, checked),
  }
}

const savePermissions = async (): Promise<void> => {
  if (!roleToConfigure.value) {
    return
  }

  const roleId = roleToConfigure.value.id
  const selectedPages = rolePermissions.value[roleId] ?? []

  isPermissionSaving.value = true

  try {
    await replaceRolePagePaths(roleId, selectedPages)

    showAlert({
      title: 'Permissions Updated',
      description: `${roleToConfigure.value.title} permissions were updated.`,
      tone: 'success',
    })

    isPermissionModalOpen.value = false
  } catch (error) {
    showAlert({
      title: 'Failed to Save Permissions',
      description: error instanceof Error ? error.message : 'Unable to save role permissions.',
      tone: 'destructive',
    })
  } finally {
    isPermissionSaving.value = false
  }
}
</script>

<template>
  <div
    v-if="props.isLoading"
    class="flex items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground"
  >
    <span class="inline-flex items-center gap-2">
      <Loader2 class="h-4 w-4 animate-spin" />
      Loading roles...
    </span>
  </div>

  <div
    v-else-if="props.roles.length === 0"
    class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center"
  >
    <p class="text-sm text-muted-foreground">No roles found for your search.</p>
  </div>

  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card
      v-for="role in props.roles"
      :key="role.id"
      class="group relative flex flex-col cursor-pointer shadow-sm transition-all hover:bg-muted/10 hover:shadow-md"
      @click="openPermissionModal(role)"
    >
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-4">
          <CardTitle class="text-lg">
            <Badge :variant="getRoleBadgeVariant(role.title)" class="text-sm">{{
              role.title
            }}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            @click.stop="openDeleteModal(role)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        <CardDescription class="mt-1.5 line-clamp-2">
          {{ role.description }}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>

  <ConfirmDeleteModal
    v-model:isOpen="isModalOpen"
    :item-name="roleToDelete?.title"
    item-type="role"
    :action="handleDeleteAction"
  />

  <PermissionModal
    v-model:isOpen="isPermissionModalOpen"
    :role="roleToConfigure"
    :pages="permissionPages"
    :selected-pages="selectedPermissionPages"
    :is-loading="isPermissionLoading"
    :is-saving="isPermissionSaving"
    @toggle-permission="togglePermission"
    @save="savePermissions"
  />
</template>
