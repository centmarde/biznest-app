<script setup lang="ts">
import ActionButtons from '@/views/(admin)/users/components/ActionButtons.vue'
import Header from '@/views/(admin)/users/components/UsersHeader.vue'
import UsersTable from '@/views/(admin)/users/components/UsersTable.vue'
</script>

<template>
  <section class="w-full space-y-5">
    <Header />

    <ActionButtons />

    <UsersTable />
  </section>
</template>

<style scoped></style>
