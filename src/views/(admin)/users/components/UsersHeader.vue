<script setup lang="ts">
import { Users } from 'lucide-vue-next'
</script>

<template>
  <header class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <Users class="text-primary shrink-0" :size="20" />
      <h1 class="text-2xl font-semibold tracking-tight">Users Management</h1>
    </div>
    <p class="text-sm text-muted-foreground">View and manage all platform users from one place.</p>
  </header>
</template>

<style scoped></style>
