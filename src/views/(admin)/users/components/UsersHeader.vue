<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TypographyH3, TypographyMuted, TypographySmall } from '@/components/typography'
import type { UserRoleFilter } from '@/views/(admin)/users/types/users-table.types'
import { ChevronDown, Search, Users } from 'lucide-vue-next'

const props = defineProps<{
  searchQuery: string
  roleFilter: UserRoleFilter
  totalUsersCount: number
  adminCount: number
  superadminCount: number
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:roleFilter', value: UserRoleFilter): void
}>()

const searchQueryModel = useVModel(props, 'searchQuery', emit)
const roleFilterModel = useVModel(props, 'roleFilter', emit)

const setRoleFilter = (value: UserRoleFilter): void => {
  roleFilterModel.value = value
}
</script>

<template>
  <header class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <Users class="text-primary shrink-0" :size="20" />
      <TypographyH3 as="h1" class="mt-0 border-none pb-0 text-2xl font-semibold tracking-tight">
        Users Management
      </TypographyH3>
    </div>
    <TypographyMuted class="mt-0"
      >View and manage all platform users from one place.</TypographyMuted
    >

    <div class="flex flex-col gap-3 mt-2 xl:flex-row xl:items-center">
      <div class="relative w-full xl:max-w-md">
        <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input class="pl-9" placeholder="Search by ID, name, or email" v-model="searchQueryModel" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="w-full justify-between xl:w-56"
            aria-label="Filter users by role"
          >
            {{ roleFilterModel === 'all' ? 'All roles' : roleFilterModel }}
            <ChevronDown class="size-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="start">
          <DropdownMenuItem @click="setRoleFilter('all')">All roles</DropdownMenuItem>
          <DropdownMenuItem @click="setRoleFilter('user')">User</DropdownMenuItem>
          <DropdownMenuItem @click="setRoleFilter('admin')">Admin</DropdownMenuItem>
          <DropdownMenuItem @click="setRoleFilter('superadmin')">Superadmin</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="xl:ml-auto">
        <slot name="actions" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Users</TypographySmall>
        <p class="text-lg font-semibold">{{ props.totalUsersCount }}</p>
      </div>
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Admin</TypographySmall>
        <p class="text-lg font-semibold">{{ props.adminCount }}</p>
      </div>
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Superadmin</TypographySmall>
        <p class="text-lg font-semibold">{{ props.superadminCount }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
