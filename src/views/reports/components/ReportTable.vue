<script setup lang="ts">
import type { ReportsTableProps } from '@/types/reports.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

defineProps<ReportsTableProps>()
</script>

<template>
  <div class="space-y-4 p-6">
    <div class="overflow-hidden rounded-xl border bg-background">
      <Table class="min-w-[780px] text-left text-sm">
        <TableHeader>
          <TableRow
            class="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted/40"
          >
            <TableHead class="px-4 py-3 font-medium">Business Owner</TableHead>
            <TableHead class="px-4 py-3 font-medium">Contact Number</TableHead>
            <TableHead class="px-4 py-3 font-medium">Business Location</TableHead>
            <TableHead class="px-4 py-3 font-medium">Zoning Classification</TableHead>
            <TableHead class="px-4 py-3 font-medium">GeoTag</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(row, rowIndex) in tableData" :key="rowIndex">
            <TableCell class="px-4 py-3">{{ row.businessOwner }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.contactNumber }}</TableCell>
            <TableCell class="px-4 py-3 text-muted-foreground">{{
              row.businessLocation
            }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.zoningClassification }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.geotag }}</TableCell>
          </TableRow>

          <TableRow v-if="!tableData || tableData.length === 0">
            <TableCell colspan="5" class="px-4 py-10 text-center text-muted-foreground">
              {{ content }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
