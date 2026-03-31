<script setup lang="ts">
import { onMounted } from 'vue'
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
import { useUserManagementStore } from '@/stores/user.management.store'
import { storeToRefs } from 'pinia'

const store = useUserManagementStore()
const { users, isLoading } = storeToRefs(store)

onMounted(() => store.fetchUsers())
</script>

<template>
  <section class="w-full space-y-5">
    <Header />

    <ActionButtons />

    <UsersTable :rows="users" :is-loading="isLoading" />
  </section>
</template>

<style scoped></style>
