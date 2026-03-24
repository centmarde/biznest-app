<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-far text-foreground">
    <Navbar />
    <RouterView />
  </div>
</template>
