<script lang="ts">
export const description = 'A login page with form and image.'
</script>

<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
</script>

<template>
  <div class="bg-far flex min-h-svh flex-col items-center justify-center">
    <div class="w-full max-w-sm md:max-w-4xl">
      <LoginForm />
    </div>
  </div>
</template>
