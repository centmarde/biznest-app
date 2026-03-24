<script setup lang="ts">
defineOptions({
  name: 'AppNavbar',
})

import { RouterLink } from 'vue-router'
import ModeToggle from '@/components/ui/ModeToggle.vue'
import { Button } from '@/components/ui/button'
</script>

<template>
  <nav class="border-b bg-background">
    <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
      <RouterLink to="/" class="text-sm font-semibold tracking-wide">BIZNEST</RouterLink>

      <div class="flex items-center gap-2">
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/">Home</RouterLink>
        </Button>
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/about">About</RouterLink>
        </Button>
        <ModeToggle />
      </div>
    </div>
  </nav>
</template>
