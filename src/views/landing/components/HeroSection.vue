<script lang="ts" setup>
defineOptions({
  name: 'HeroSection',
})

import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import TypographyH1 from '@/components/typography/TypographyH1.vue'
import TypographyMuted from '@/components/typography/TypographyMuted.vue'
import TypographyList from '@/components/typography/TypographyList.vue'
import { partners } from '../constants/partners'
</script>

<template>
  <section class="relative w-full overflow-hidden py-20 text-white md:py-28">
    <div
      class="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-8 px-6 md:flex-row md:gap-10 md:px-10"
    >
      <!-- Left: Text & CTAs -->
      <div class="flex-1 flex flex-col items-start text-left">
        <Badge class="mb-4">For Growth-Minded Founders <br /></Badge>
        <TypographyH1 class="mb-3">
          Smart <span class="text-accent">Locations. <br /></span> Stronger
          <span class="text-accent">Connections.</span> Powered by AI.
        </TypographyH1>
        <TypographyMuted class="text-lg md:text-xl mb-6 max-w-xl">
          An AI-powered system that helps choose business locations and connects local businesses in
          your city.
        </TypographyMuted>

        <!-- CTA Buttons -->
        <div class="flex gap-3 mb-6">
          <Button as-child>
            <RouterLink to="/register">Join BizNest Now</RouterLink>
          </Button>
          <Button as-child variant="ghost">
            <RouterLink to="/learn-more">See How AI Helps</RouterLink>
          </Button>
        </div>

        <!-- Benefit Bullets -->
        <TypographyList
          class="my-0 ml-0 list-none flex flex-col gap-2 text-md text-foreground/90 [&>li]:mt-0"
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
    <div class="mt-16 w-full border-t border-white/10 px-6 pt-10 md:px-10">
      <div
        class="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center gap-6 md:flex-row md:gap-12"
      >
        <span
          class="text-md font-semibold uppercase tracking-widest text-foreground/80 text-center"
        >
          In partnership with
        </span>

        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="flex items-center gap-3 transition-all duration-300 cursor-default"
          >
            <img
              :src="partner.logoUrl"
              :alt="partner.name"
              class="h-8 md:h-12 w-auto object-contain rounded-full"
              @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
            />
            <span class="text-md md:text-lg font-medium text-foreground/90">
              {{ partner.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
