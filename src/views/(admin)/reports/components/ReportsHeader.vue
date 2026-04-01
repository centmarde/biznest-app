<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import type { ReportHeaderProps } from '@/types/reports.types'

defineProps<ReportHeaderProps>()
</script>
<template>
  <div>
    <header class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <FileText class="text-primary shrink-0" :size="20" />
        <h1 class="text-2xl font-semibold tracking-tight">Saved Reports</h1>
      </div>
      <p class="text-sm text-muted-foreground">Analysis reports saved from the Map page.</p>
    </header>

    <div v-if="loading" class="py-6 text-center">
      <p class="text-sm text-muted-foreground">Loading reports...</p>
    </div>

    <div v-else-if="error" class="py-6 text-center">
      <p class="text-sm text-destructive">Error loading reports: {{ error }}</p>
    </div>

    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
