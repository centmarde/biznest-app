<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Download, Upload, UserPlus } from 'lucide-vue-next'
</script>

<template>
  <div class="flex w-full flex-wrap items-center justify-end gap-2">
    <Button variant="default">
      <UserPlus class="size-4" />
      Add User
    </Button>
    <Button variant="outline">
      <Upload class="size-4" />
      Import
    </Button>
    <Button variant="outline">
      <Download class="size-4" />
      Export
    </Button>
  </div>
</template>

<style scoped></style>
