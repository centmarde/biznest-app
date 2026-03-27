<script setup lang="ts">
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import InnerNavbar from '@/components/InnerNavbar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-far text-foreground">
    <InnerNavbar />
    <div class="flex flex-1">
      <AdminSidebar />
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
