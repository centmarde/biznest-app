<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import PaginationLink from './PaginationLink.vue'
</script>

<template>
  <PaginationLink data-slot="pagination-next" size="default" class="gap-1.5 px-3">
    <span>Next</span>
    <ChevronRight class="size-4" />
  </PaginationLink>
</template>
