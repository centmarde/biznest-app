<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { TypographyH3, TypographyMuted, TypographySmall } from '@/components/typography'
import { Search, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  searchQuery: string
  totalRolesCount: number
  activeRolesCount: number
  systemRolesCount: number
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
}>()

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
})
</script>

<template>
  <header class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <ShieldCheck class="text-primary shrink-0" :size="20" />
      <TypographyH3 as="h1" class="mt-0 border-none pb-0 text-2xl font-semibold tracking-tight">
        Roles Management
      </TypographyH3>
    </div>

    <TypographyMuted class="mt-0">
      Create and maintain role permissions and access levels from one place.
    </TypographyMuted>

    <div class="flex flex-col gap-3 mt-2 xl:flex-row xl:items-center">
      <div class="relative w-full xl:max-w-md">
        <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input class="pl-9" placeholder="Search role by name" v-model="searchQueryModel" />
      </div>

      <div class="xl:ml-auto">
        <slot name="actions" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Roles</TypographySmall>
        <p class="text-lg font-semibold">{{ props.totalRolesCount }}</p>
      </div>
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Active</TypographySmall>
        <p class="text-lg font-semibold">{{ props.activeRolesCount }}</p>
      </div>
      <div class="rounded-md border bg-muted/20 px-3 py-2">
        <TypographySmall as="p" class="text-muted-foreground uppercase">System</TypographySmall>
        <p class="text-lg font-semibold">{{ props.systemRolesCount }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
