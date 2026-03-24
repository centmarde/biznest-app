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
      <RouterLink
        to="/"
        class="text-md text-foreground dark:text-primary font-semibold tracking-wide"
        >BizNest</RouterLink
      >

      <div class="flex items-center gap-4">
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/">Home</RouterLink>
        </Button>
        <Button as-child variant="ghost" size="sm">
          <RouterLink to="/about">About</RouterLink>
        </Button>
        <ModeToggle />
        <Button
          as-child
          variant="outline"
          size="sm"
          class="bg-foreground text-background hover:bg-foreground/90 hover:text-background/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 dark:hover:text-background/90"
        >
          <RouterLink to="/login">Get Started</RouterLink>
        </Button>
      </div>
    </div>
  </nav>
</template>
