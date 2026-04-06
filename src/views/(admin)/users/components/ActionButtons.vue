<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Upload, UserPlus } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'add-user'): void
}>()

const triggerExport = () => {
  emit('export')
}

const triggerAddUser = () => {
  emit('add-user')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <Button variant="default" @click="triggerAddUser">
      <UserPlus class="size-4" />
      Add User
    </Button>
    <Button variant="outline" @click="triggerExport">
      <Upload class="size-4" />
      Export
    </Button>
  </div>
</template>

<style scoped></style>
