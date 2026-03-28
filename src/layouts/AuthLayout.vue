<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="h-svh min-h-svh overflow-hidden flex flex-col">
    <Navbar />
    <main class="flex-1 h-full min-h-0 overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>
