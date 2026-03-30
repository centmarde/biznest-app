<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { Button } from '@/components/ui/button'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'
import { USER_STATUS_CLASS } from '@/views/(admin)/users/utils/users-table.utils'
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    rows?: UserRow[]
  }>(),
  {
    rows: () => [],
  },
)

const pageSize = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / pageSize)))
const hasRows = computed(() => props.rows.length > 0)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.rows.slice(start, start + pageSize)
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
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-xl border bg-background">
      <Table class="min-w-[780px] text-left text-sm">
        <TableHeader>
          <TableRow
            class="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted/40"
          >
            <TableHead class="px-4 py-3 font-medium">ID</TableHead>
            <TableHead class="px-4 py-3 font-medium">Name</TableHead>
            <TableHead class="px-4 py-3 font-medium">Email</TableHead>
            <TableHead class="px-4 py-3 font-medium">Role</TableHead>
            <TableHead class="px-4 py-3 font-medium">Status</TableHead>
            <TableHead class="px-4 py-3 text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="row in paginatedRows" :key="row.id">
            <TableCell class="px-4 py-3 font-medium">{{ row.id }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.fullName }}</TableCell>
            <TableCell class="px-4 py-3 text-muted-foreground">{{ row.email }}</TableCell>
            <TableCell class="px-4 py-3">{{ row.role }}</TableCell>
            <TableCell class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="USER_STATUS_CLASS[row.status]"
              >
                {{ row.status }}
              </span>
            </TableCell>
            <TableCell class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline">
                  <Pencil class="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 class="size-4" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!hasRows">
            <TableCell colspan="6" class="px-4 py-10 text-center text-muted-foreground">
              No users found.
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

<style scoped></style>
