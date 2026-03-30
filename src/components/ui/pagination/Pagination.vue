<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <nav
    role="navigation"
    aria-label="pagination"
    data-slot="pagination"
    :class="cn('mx-auto flex w-full justify-center', $props.class)"
  >
    <slot />
  </nav>
</template>
