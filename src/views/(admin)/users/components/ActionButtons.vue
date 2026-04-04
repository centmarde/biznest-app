<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Download, Upload, UserPlus } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'import', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('import', file)
  }
  // Reset input
  if (target) {
    target.value = ''
  }
}

const triggerExport = () => {
  emit('export')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <Button variant="default">
      <UserPlus class="size-4" />
      Add User
    </Button>
    <Button variant="outline" @click="triggerImport">
      <Download class="size-4" />
      Import
    </Button>
    <input
      type="file"
      accept=".csv"
      ref="fileInput"
      class="hidden"
      @change="handleFileUpload"
    />
    <Button variant="outline" @click="triggerExport">
      <Upload class="size-4" />
      Export
    </Button>
  </div>
</template>

<style scoped></style>
