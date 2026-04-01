<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ReportsTableProps } from '@/types/reports.types'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = withDefaults(defineProps<ReportsTableProps>(), {
  tableData: () => [],
  content: 'No reports available.',
})

const pageSize = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(props.tableData.length / pageSize)))
const hasRows = computed(() => props.tableData.length > 0)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.tableData.slice(start, start + pageSize)
})

type VisiblePageItem = number | 'ellipsis-left' | 'ellipsis-right'

const visiblePages = computed<VisiblePageItem[]>(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', total]
  }

  if (current >= total - 3) {
    return [1, 'ellipsis-left', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, 'ellipsis-left', current - 1, current, current + 1, 'ellipsis-right', total]
})

const setPage = (page: number): void => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

const previousPage = (): void => setPage(currentPage.value - 1)
const nextPage = (): void => setPage(currentPage.value + 1)

watch(
  () => props.tableData,
  () => {
    currentPage.value = 1
  },
)
</script>

<template>
  <div class="space-y-4">
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
          <TableRow v-for="(row, rowIndex) in paginatedRows" :key="rowIndex">
            <TableCell class="px-4 py-3">{{ row.businessOwner }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.contactNumber }}</TableCell>
            <TableCell class="px-4 py-3 text-muted-foreground">{{
              row.businessLocation
            }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.zoningClassification }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.geotag }}</TableCell>
          </TableRow>

          <TableRow v-if="!hasRows">
            <TableCell colspan="5" class="px-4 py-10 text-center text-muted-foreground">
              {{ content }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Pagination v-if="hasRows" class="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            :class="currentPage === 1 ? 'pointer-events-none opacity-50' : ''"
            @click.prevent="previousPage"
          />
        </PaginationItem>

        <PaginationItem v-for="pageItem in visiblePages" :key="String(pageItem)">
          <PaginationEllipsis
            v-if="pageItem === 'ellipsis-left' || pageItem === 'ellipsis-right'"
          />
          <PaginationLink
            v-else
            href="#"
            :is-active="currentPage === pageItem"
            @click.prevent="setPage(pageItem)"
          >
            {{ pageItem }}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            :class="currentPage === totalPages ? 'pointer-events-none opacity-50' : ''"
            @click.prevent="nextPage"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</template>
