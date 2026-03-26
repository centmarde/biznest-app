<script setup lang="ts">
import AlertContextHost from '@/components/AlertContextHost.vue'
import { provideAlertContext } from '@/composables/useAlert'
import { RouterView } from 'vue-router'

provideAlertContext()
</script>

<template>
  <RouterView />
  <AlertContextHost />
</template>
