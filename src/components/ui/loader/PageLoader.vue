<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    compact?: boolean
  }>(),
  {
    label: 'Loading page',
    compact: false,
  },
)
</script>

<template>
  <div
    :class="
      compact
        ? 'flex items-center justify-center py-8'
        : 'flex min-h-[40vh] items-center justify-center'
    "
    role="status"
    :aria-label="label"
  >
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
