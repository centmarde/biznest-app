<script setup lang="ts">
import { Download } from 'lucide-vue-next';
import type { TabAndExportButtonsProps } from '@/types/reports.types';

defineProps<TabAndExportButtonsProps>();
const emit = defineEmits<{
  change: [index: number];
  export: [];
}>();
</script>

<template>
  <div class="border-b border-border flex items-center justify-between">
    <div class="flex gap-0" role="tablist" aria-label="basic tabs example">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        role="tab"
        :id="`simple-tab-${index}`"
        :aria-controls="`simple-tabpanel-${index}`"
        :aria-selected="value === index"
        :class="[
          'px-4 py-3 bg-transparent border-none cursor-pointer text-sm font-medium uppercase transition-colors relative',
          value === index
            ? 'text-primary after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
            : 'text-muted-foreground hover:text-foreground/80'
        ]"
        @click="emit('change', index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <button
      v-if="canExport"
      @click="emit('export')"
      class="flex items-center gap-1.5 px-4 py-1.5 mr-7 my-auto bg-primary text-primary-foreground border-none rounded font-medium text-sm cursor-pointer transition-colors hover:bg-primary/90 active:bg-primary/80"
      title="Export to PDF"
    >
      <Download :size="18" />
      <span>Export PDF</span>
    </button>
  </div>
</template>