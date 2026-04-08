<script lang="ts" setup>
defineOptions({
    name: 'DashboardHeader',
})
 import TypographyH1 from '@/components/typography/TypographyH1.vue'
</script>

<template>
    <div class="w-full">
        <TypographyH1 class="text-3xl font-bold mb-4">Welcome to your dashboard!</TypographyH1>
        <p>Here you can manage your projects, view analytics, and customize your settings.</p>
    </div>
</template>