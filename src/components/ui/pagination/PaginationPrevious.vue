<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import PaginationLink from './PaginationLink.vue'
</script>

<template>
  <PaginationLink data-slot="pagination-previous" size="default" class="gap-1.5 px-3">
    <ChevronLeft class="size-4" />
    <span>Previous</span>
  </PaginationLink>
</template>
