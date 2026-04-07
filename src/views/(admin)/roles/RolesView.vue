<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import RolesHeader from '@/views/(admin)/roles/components/RolesHeader.vue'
import RolesButtons from '@/views/(admin)/roles/components/RolesButtons.vue'
import RolesModal from '@/views/(admin)/roles/components/RolesModal.vue'
import RolesCards from '@/views/(admin)/roles/components/RolesCards.vue'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'
import { getRoleCounts, filterRoleRows } from '@/views/(admin)/roles/utils/roles.utils'
import { useRolesStore } from '@/stores/roles.store'

const searchQuery = ref('')
const addRoleModalOpen = ref(false)

const rolesStore = useRolesStore()
const { roles } = storeToRefs(rolesStore)
const { loadRoles } = rolesStore

const roleCounts = computed(() => getRoleCounts(roles.value))

const filteredRows = computed<RoleRow[]>(() => filterRoleRows(roles.value, searchQuery.value))

const openAddRoleModal = (): void => {
  addRoleModalOpen.value = true
}

const refreshRoles = async (): Promise<void> => {
  await loadRoles()
}

const handleRoleCreated = (newRole: RoleRow): void => {
  const alreadyExists = roles.value.some((role) => role.id === newRole.id)

  if (!alreadyExists) {
    roles.value = [...roles.value, newRole].sort((a, b) => a.title.localeCompare(b.title))
  }

  // Keep optimistic UI instant, then sync with server state in the background.
  void refreshRoles()
}

onMounted(() => {
  loadRoles()
})
</script>

<template>
  <section class="w-full space-y-5">
    <RolesHeader
      v-model:search-query="searchQuery"
      :total-roles-count="roleCounts.total"
      :active-roles-count="roleCounts.active"
      :system-roles-count="roleCounts.system"
    >
      <template #actions>
        <RolesButtons @add-role="openAddRoleModal" />
      </template>
    </RolesHeader>
    <RolesCards :roles="filteredRows" @deleted="refreshRoles" />
    <RolesModal v-model:isOpen="addRoleModalOpen" @created="handleRoleCreated" />
  </section>
</template>
