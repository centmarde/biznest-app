<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
    <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
  </header>
</template>

<style scoped></style>
