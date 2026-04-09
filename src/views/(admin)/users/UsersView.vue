<script setup lang="ts">
import  { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
import AddUserModal from '@/views/(admin)/users/components/AddUserModal.vue'
import { TypographySmall } from '@/components/typography'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'
import { useUsersStore } from '@/stores/users.store'

const usersStore = useUsersStore()

const {
  usersError,
  isLoadingUsers,
  searchQuery,
  roleFilter,
  addUserModalOpen,
  filteredRows,
  roleCounts,
} = storeToRefs(usersStore)

const {
  loadUsers,
  exportFilteredRowsToCsv,
  importUsersFromCsv,
  setAddUserModalOpen,
  removeUserLocally,
  upsertUser,
} = usersStore

const handleExportCsv = () => {
  exportFilteredRowsToCsv()
}

const handleImportCsv = async (file: File) => {
  try {
    await importUsersFromCsv(file)
  } catch (error) {
    console.error('Failed to parse CSV', error)
    usersError.value = 'Failed to read the imported CSV.'
  }
}

const handleAddUser = () => {
  setAddUserModalOpen(true)
}

const handleUserDeleted = (id: string) => {
  removeUserLocally(id)
}

const handleUserUpdated = (user: UserRow) => {
  upsertUser(user)
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section class="w-full space-y-5 p-4 md:p-6">
    <Header
      v-model:search-query="searchQuery"
      v-model:role-filter="roleFilter"
      :total-users-count="roleCounts.users"
      :admin-count="roleCounts.admin"
      :superadmin-count="roleCounts.superadmin"
    >
      <template #actions>
        <ActionButtons
          @export="handleExportCsv"
          @import="handleImportCsv"
          @add-user="handleAddUser"
        />
      </template>
    </Header>

    <TypographySmall
      v-if="usersError"
      class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {{ usersError }}
    </TypographySmall>
    <UsersTable
      :rows="filteredRows"
      :is-loading="isLoadingUsers"
      @refresh="loadUsers"
      @user-deleted="handleUserDeleted"
      @user-updated="handleUserUpdated"
    />

    <AddUserModal v-model:isOpen="addUserModalOpen" />
  </section>
</template>

<style scoped></style>
