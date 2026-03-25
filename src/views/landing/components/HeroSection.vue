<script lang="ts" setup>
defineOptions({
  name: 'HeroSection',
})

import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import TypographyH1 from '@/components/typography/TypographyH1.vue'
import TypographyMuted from '@/components/typography/TypographyMuted.vue'
import TypographyList from '@/components/typography/TypographyList.vue'
</script>

<template>
  <section class="relative overflow-hidden text-white py-20">
    <div
      class="w-full max-w-screen-2xl mx-auto px-10 mt-8 flex flex-col md:flex-row items-center gap-12"
    >
      <!-- Left: Text & CTAs -->
      <div class="flex-1 flex flex-col items-start text-left">
        <Badge variant="outline" class="mb-4">Start Here</Badge>
        <TypographyH1 class="mb-3">
          Smart <span class="text-accent">Locations.</span> Stronger
          <span class="text-accent">Connections.</span> Powered by AI.
        </TypographyH1>
        <TypographyMuted class="text-lg md:text-xl mb-6 max-w-xl">
          An AI-powered system that helps choose business locations and connects local businesses in
          your city.
        </TypographyMuted>

        <!-- CTA Buttons -->
        <div class="flex gap-3 mb-6">
          <Button as-child size="lg" class="text-lg">
            <RouterLink to="/register">Join Us</RouterLink>
          </Button>
          <Button as-child variant="ghost" size="lg" class="text-md">
            <RouterLink to="/learn-more">Learn More</RouterLink>
          </Button>
        </div>

        <!-- Benefit Bullets -->
        <TypographyList
          class="my-0 ml-0 list-none flex flex-col gap-2 text-md text-foreground/60 [&>li]:mt-0"
        >
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-foreground/50 shrink-0"></span>
            AI-driven location insights tailored to your industry
          </li>
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-foreground/50 shrink-0"></span>
            Connect with nearby businesses instantly
          </li>
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-foreground/50 shrink-0"></span>
            Free to join — get started in minutes
          </li>
        </TypographyList>
      </div>

      <!-- Right: Sample Image -->
      <div class="flex-1 flex justify-center items-center">
        <div
          class="w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden bg-white/10 border border-white/10 shadow-xl"
        >
          <img
            src="https://placehold.co/800x600/1a1a2e/ffffff?text=App+Preview"
            alt="App preview"
            class="w-full h-full object-cover opacity-80"
          />
        </div>
      </div>
    </div>
  </section>
</template>
