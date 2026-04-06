<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'add-role'): void
  (e: 'refresh'): void
}>()

const triggerAddRole = () => {
  emit('add-role')
}

const triggerRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <Button variant="default" @click="triggerAddRole">
      <Plus class="size-4" />
      Add Role
    </Button>
    <Button variant="outline" @click="triggerRefresh">
      <RefreshCw class="size-4" />
      Refresh
    </Button>
  </div>
</template>

<style scoped></style>
