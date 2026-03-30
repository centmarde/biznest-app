<script setup lang="ts">
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/Header.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
</script>

<template>
  <section class="w-full space-y-5">
    <Header
      title="Users Management"
      subtitle="View and manage all platform users from one place."
    />

    <ActionButtons />

    <UsersTable />
  </section>
</template>

<style scoped></style>
