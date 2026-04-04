<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
import { fetchAllUsers } from '@/services/users.service'
import type { UserRoleFilter, UserRow } from '@/views/(admin)/users/types/users-table.types'
import {
  filterUserRows,
  getUserRoleCounts,
  exportUsersToCsv,
  parseUsersCsv,
} from '@/views/(admin)/users/utils/users-table.utils'

const rows = ref<UserRow[]>([])
const isLoadingUsers = ref(false)
const usersError = ref<string | null>(null)
const searchQuery = ref('')
const roleFilter = ref<UserRoleFilter>('all')

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to load users right now.'
}

const loadUsers = async (): Promise<void> => {
  isLoadingUsers.value = true
  usersError.value = null

  try {
    rows.value = await fetchAllUsers()
  } catch (error) {
    rows.value = []
    usersError.value = getErrorMessage(error)
  } finally {
    isLoadingUsers.value = false
  }
}

const filteredRows = computed<UserRow[]>(() =>
  filterUserRows(rows.value, searchQuery.value, roleFilter.value),
)

const roleCounts = computed(() => getUserRoleCounts(rows.value))

const handleExportCsv = () => {
  exportUsersToCsv(filteredRows.value)
}

const handleImportCsv = async (file: File) => {
  try {
    const newRows = await parseUsersCsv(file)
    if (newRows.length > 0) {
      // Basic implementation for mock/preview: append unique rows by id
      const existingIds = new Set(rows.value.map((r) => r.id))
      const uniqueNewRows = newRows.filter((r) => !existingIds.has(r.id))
      rows.value = [...rows.value, ...uniqueNewRows]
    }
  } catch (error) {
    console.error('Failed to parse CSV', error)
    usersError.value = 'Failed to read the imported CSV.'
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section class="w-full space-y-5">
    <Header
      v-model:search-query="searchQuery"
      v-model:role-filter="roleFilter"
      :total-users-count="roleCounts.users"
      :admin-count="roleCounts.admin"
      :superadmin-count="roleCounts.superadmin"
    >
      <template #actions>
        <ActionButtons @export="handleExportCsv" @import="handleImportCsv" />
      </template>
    </Header>

    <p
      v-if="usersError"
      class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {{ usersError }}
    </p>
    <p v-else-if="isLoadingUsers" class="text-sm text-muted-foreground">Loading users...</p>

    <UsersTable
      :rows="filteredRows"
      @refresh="loadUsers"
      @user-deleted="(id) => (rows = rows.filter((r) => r.id !== id))"
      @user-updated="
        (user) => {
          const idx = rows.findIndex((r) => r.id === user.id)
          if (idx !== -1) rows[idx] = user
        }
      "
    />
  </section>
</template>

<style scoped></style>
