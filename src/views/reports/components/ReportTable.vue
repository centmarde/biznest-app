<script setup lang="ts">
import type { ReportsTableProps } from '@/types/reports.types';

defineProps<ReportsTableProps>();
</script>

<template>
  <div class="p-6">
    <table v-if="tableData" class="w-full border-collapse">
      <thead>
        <tr class="bg-muted border-b-2 border-border">
          <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Business Owner</th>
          <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Contact Number</th>
          <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Business Location</th>
          <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">Zoning Classification</th>
          <th class="px-4 py-3 text-left font-semibold text-xs text-foreground uppercase">GeoTag</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex" class="border-b border-border last:border-b-0">
          <td class="px-4 py-3 text-sm text-foreground">{{ row.businessOwner }}</td>
          <td class="px-4 py-3 text-sm text-foreground">{{ row.contactNumber }}</td>
          <td class="px-4 py-3 text-sm text-foreground">{{ row.businessLocation }}</td>
          <td class="px-4 py-3 text-sm text-foreground">{{ row.zoningClassification }}</td>
          <td class="px-4 py-3 text-sm text-foreground">{{ row.geotag }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      {{ content }}
    </div>
  </div>
</template>