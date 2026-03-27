<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import { TypographyH3, TypographyP } from '@/components/typography';
import type { ReportHeaderProps } from '@/types/reports.types';

defineProps<ReportHeaderProps>();
</script>
<template>
  <div class="w-full">
    <div class="my-4 mx-4 mb-3">
      <div class="flex items-center justify-start gap-2">
        <FileText class="text-primary shrink-0" :size="24" />
        <TypographyH3>Saved Reports</TypographyH3>
      </div>
      <TypographyP class="mt-1.5">Analysis reports saved from the Map page.</TypographyP>
    </div>

    <div v-if="loading" class="p-6 text-center">
      <TypographyP class="text-muted-foreground">Loading reports...</TypographyP>
    </div>

    <div v-else-if="error" class="p-6 text-center">
      <TypographyP class="text-destructive">Error loading reports: {{ error }}</TypographyP>
    </div>

    <slot />
  </div>
</template>