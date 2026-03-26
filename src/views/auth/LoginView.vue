<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
import coverImage from '@/assets/images/navigatu.jpg'
</script>

<template>
  <section class="h-full min-h-full overflow-hidden bg-far text-foreground">
    <div class="grid h-full min-h-full lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div class="bg-muted relative hidden lg:block">
        <img
          :src="coverImage"
          alt="Abstract workspace background"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-black/35" />
      </div>
    </div>
  </section>
</template>
