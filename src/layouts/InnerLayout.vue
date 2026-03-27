<script setup lang="ts">
import { RouterView } from 'vue-router'
import InnerNavbar from '@/components/InnerNavbar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-far text-foreground">
    <InnerNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
