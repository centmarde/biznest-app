<script setup lang="ts">
import { computed, ref } from 'vue'
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
import type { UserRoleFilter, UserRow } from '@/views/(admin)/users/types/users-table.types'
import { filterUserRows, getUserRoleCounts } from '@/views/(admin)/users/utils/users-table.utils'

const rows = ref<UserRow[]>([])
const searchQuery = ref('')
const roleFilter = ref<UserRoleFilter>('all')

const filteredRows = computed<UserRow[]>(() =>
  filterUserRows(rows.value, searchQuery.value, roleFilter.value),
)

const roleCounts = computed(() => getUserRoleCounts(rows.value))
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
        <ActionButtons />
      </template>
    </Header>

    <UsersTable :rows="filteredRows" />
  </section>
</template>

<style scoped></style>
