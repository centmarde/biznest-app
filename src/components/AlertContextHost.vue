<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, CircleAlert } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAlertContext } from '@/composables/useAlert'
import { cn } from '@/lib/utils'

const { alert } = useAlertContext()

const toneClassName = computed(() => {
  if (alert.value?.tone === 'destructive') {
    return 'border-destructive/45 bg-destructive/12 text-destructive'
  }

  return 'border-success/45 bg-success/12 text-success'
})
</script>

<template>
  <div class="pointer-events-none fixed top-20 right-4 z-50 w-[calc(100%-2rem)] max-w-sm">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-8 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition-all duration-250 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-8 opacity-0"
    >
      <Alert
        v-if="alert"
        :key="alert.id"
        :class="cn('pointer-events-auto shadow-lg', toneClassName)"
      >
        <CheckCircle2 v-if="alert.tone === 'success'" />
        <CircleAlert v-else />
        <AlertTitle>{{ alert.title }}</AlertTitle>
        <AlertDescription>{{ alert.description }}</AlertDescription>
      </Alert>
    </Transition>
  </div>
</template>
