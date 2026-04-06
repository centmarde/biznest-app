<script setup lang="ts">
import { TypographyH3, TypographyMuted, TypographySmall } from '@/components/typography'
import { ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  searchQuery: string
  totalRolesCount: number
}>()
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
      <div class="rounded-md border bg-muted/20 px-3 py-2 w-full sm:w-1/3 xl:w-auto min-w-[150px]">
        <TypographySmall as="p" class="text-muted-foreground uppercase">Roles</TypographySmall>
        <p class="text-lg font-semibold">{{ props.totalRolesCount }}</p>
      </div>

      <div class="xl:ml-auto">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped></style>
