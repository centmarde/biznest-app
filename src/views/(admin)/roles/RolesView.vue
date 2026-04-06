<script setup lang="ts">
import { computed, ref } from 'vue'
import RolesHeader from '@/views/(admin)/roles/components/RolesHeader.vue'
import RolesButtons from '@/views/(admin)/roles/components/RolesButtons.vue'
import RolesModal from '@/views/(admin)/roles/components/RolesModal.vue'

type RoleStatus = 'active' | 'inactive'

interface RoleRow {
  id: string
  name: string
  description: string
  status: RoleStatus
  isSystem: boolean
}

const searchQuery = ref('')
const addRoleModalOpen = ref(false)

const rows = ref<RoleRow[]>([
  {
    id: 'role-1',
    name: 'Superadmin',
    description: 'Full platform control and all administrative permissions.',
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Can manage users, reports, and operational settings.',
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-3',
    name: 'Reviewer',
    description: 'Reviews submissions and moderates role-based workflows.',
    status: 'active',
    isSystem: false,
  },
  {
    id: 'role-4',
    name: 'Assistant',
    description: 'Supports daily operations with limited scoped permissions.',
    status: 'inactive',
    isSystem: false,
  },
])

const roleCounts = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter((row) => row.status === 'active').length
  const system = rows.value.filter((row) => row.isSystem).length

  return {
    total,
    active,
    system,
  }
})

const filteredRows = computed<RoleRow[]>(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return rows.value
  }

  return rows.value.filter((row) => {
    return (
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.description.toLowerCase().includes(normalizedQuery) ||
      row.id.toLowerCase().includes(normalizedQuery)
    )
  })
})

const openAddRoleModal = (): void => {
  addRoleModalOpen.value = true
}

const refreshRoles = (): void => {
  rows.value = [...rows.value]
}
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

    <div class="rounded-lg border">
      <div class="border-b bg-muted/10 px-4 py-3">
        <p class="text-sm font-medium">Role List</p>
      </div>

      <div class="divide-y">
        <div v-if="filteredRows.length === 0" class="px-4 py-6 text-sm text-muted-foreground">
          No roles found for your search.
        </div>

        <div
          v-for="role in filteredRows"
          :key="role.id"
          class="flex items-start justify-between gap-3 px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold">{{ role.name }}</p>
            <p class="text-xs text-muted-foreground">{{ role.description }}</p>
          </div>

          <span
            class="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium"
            :class="
              role.status === 'active'
                ? 'border-green-500/30 bg-green-500/10 text-green-700'
                : 'border-muted-foreground/30 bg-muted text-muted-foreground'
            "
          >
            {{ role.status }}
          </span>
        </div>
      </div>
    </div>

    <RolesModal v-model:isOpen="addRoleModalOpen" />
  </section>
</template>
