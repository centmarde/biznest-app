<script setup lang="ts">
import AlertContextHost from '@/components/AlertContextHost.vue'
import { PageLoader } from '@/components/ui/loader'
import { provideAlertContext } from '@/composables/useAlert'
import router from '@/router'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

provideAlertContext()

const isPageLoading = ref(true)
let pendingLoadId = 0

const stopBeforeEach = router.beforeEach(() => {
  pendingLoadId += 1
  isPageLoading.value = true
})

const stopAfterEach = router.afterEach(() => {
  const currentLoadId = ++pendingLoadId

  // Keep the loader visible briefly so fast transitions don't flash.
  window.setTimeout(() => {
    if (currentLoadId === pendingLoadId) {
      isPageLoading.value = false
    }
  }, 150)
})

onMounted(() => {
  window.setTimeout(() => {
    if (isPageLoading.value) {
      isPageLoading.value = false
    }
  }, 150)
})

onBeforeUnmount(() => {
  stopBeforeEach()
  stopAfterEach()
})
</script>

<template>
  <RouterView />
  <div
    v-if="isPageLoading"
    class="fixed inset-0 z-[90] flex items-center justify-center bg-background"
  >
    <PageLoader label="Loading page" compact />
  </div>
  <AlertContextHost />
</template>
