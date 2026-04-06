<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import RolesHeader from '@/views/(admin)/roles/components/RolesHeader.vue'
import RolesButtons from '@/views/(admin)/roles/components/RolesButtons.vue'
import RolesModal from '@/views/(admin)/roles/components/RolesModal.vue'
import RolesCards from '@/views/(admin)/roles/components/RolesCards.vue'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'
import { getRoleCounts, filterRoleRows } from '@/views/(admin)/roles/utils/roles.utils'
import { fetchRoles } from '@/services/roles.service'

const searchQuery = ref('')
const addRoleModalOpen = ref(false)

const rows = ref<RoleRow[]>([])

const roleCounts = computed(() => getRoleCounts(rows.value))

const filteredRows = computed<RoleRow[]>(() => filterRoleRows(rows.value, searchQuery.value))

const openAddRoleModal = (): void => {
  addRoleModalOpen.value = true
}

const loadRoles = async (): Promise<void> => {
  try {
    rows.value = await fetchRoles()
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const refreshRoles = async (): Promise<void> => {
  await loadRoles()
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
        <RolesButtons @add-role="openAddRoleModal" @refresh="refreshRoles" />
      </template>
    </RolesHeader>
    <RolesCards :roles="filteredRows" />
    <RolesModal v-model:isOpen="addRoleModalOpen" />
  </section>
</template>
