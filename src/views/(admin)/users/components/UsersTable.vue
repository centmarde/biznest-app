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
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'

interface UserRow {
  id: string
  fullName: string
  email: string
  role: string
  status: 'Active' | 'Pending' | 'Suspended'
}

const rows: UserRow[] = [
  {
    id: 'U-001',
    fullName: 'Ava Reynolds',
    email: 'ava.reynolds@biznest.app',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'U-002',
    fullName: 'Noah Patel',
    email: 'noah.patel@biznest.app',
    role: 'Manager',
    status: 'Pending',
  },
  {
    id: 'U-003',
    fullName: 'Mila Santos',
    email: 'mila.santos@biznest.app',
    role: 'Staff',
    status: 'Suspended',
  },
]

const statusClass: Record<UserRow['status'], string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
}

const pageSize = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(rows.length / pageSize)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return rows.slice(start, start + pageSize)
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
      <div class="overflow-x-auto">
        <table class="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr class="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Role</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id" class="border-b last:border-b-0">
              <td class="px-4 py-3 font-medium">{{ row.id }}</td>
              <td class="px-4 py-3">{{ row.fullName }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ row.email }}</td>
              <td class="px-4 py-3">{{ row.role }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusClass[row.status]"
                >
                  {{ row.status }}
                </span>
              </td>
              <td class="px-4 py-3">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination class="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            :class="currentPage === 1 ? 'pointer-events-none opacity-50' : ''"
            @click.prevent="previousPage"
          />
        </PaginationItem>

        <PaginationItem v-for="page in totalPages" :key="page">
          <PaginationLink href="#" :is-active="currentPage === page" @click.prevent="setPage(page)">
            {{ page }}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem v-if="totalPages > 5">
          <PaginationEllipsis />
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
