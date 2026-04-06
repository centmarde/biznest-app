<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { RoleRow } from '@/views/(admin)/roles/types/roles.types'

defineProps<{
  roles: RoleRow[]
}>()
</script>

<template>
  <div
    v-if="roles.length === 0"
    class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center"
  >
    <p class="text-sm text-muted-foreground">No roles found for your search.</p>
  </div>

  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card
      v-for="role in roles"
      :key="role.id"
      class="flex flex-col shadow-sm transition-all hover:shadow-md"
    >
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between gap-4">
          <CardTitle class="text-lg">{{ role.title }}</CardTitle>
        </div>
        <CardDescription class="mt-1.5 line-clamp-2">
          {{ role.description }}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
</template>
