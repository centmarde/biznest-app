<script setup lang="ts">
import type { Component } from 'vue'
import { Clock3, Mail, MapPin } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import logoImage from '@/assets/images/logo.png'
import {
  footerBrandDescription,
  footerBrandName,
  footerContactItems,
  footerCurrentYear,
  footerLegalLinks,
  footerQuickLinks,
  type FooterContactIcon,
} from '@/types/footer'

defineOptions({
  name: 'AppFooter',
})

const contactIconMap: Record<FooterContactIcon, Component> = {
  mail: Mail,
  'map-pin': MapPin,
  'clock-3': Clock3,
}

const resolveContactIcon = (icon: FooterContactIcon): Component => contactIconMap[icon]
</script>

<template>
  <footer class="mt-16 border-t border-border/80 bg-background/95">
    <div class="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <div class="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div class="space-y-4">
          <RouterLink to="/" class="inline-flex items-center gap-3 text-foreground">
            <span
              class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
            >
              <img :src="logoImage" alt="BizNest logo" class="h-full w-full object-contain" />
            </span>
            <span class="text-xl font-semibold tracking-wide">{{ footerBrandName }}</span>
          </RouterLink>
          <p class="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {{ footerBrandDescription }}
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
            Quick Links
          </h3>
          <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
            <li v-for="link in footerQuickLinks" :key="link.label">
              <RouterLink
                :to="link.to"
                class="transition-colors duration-200 hover:text-foreground"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">Contact</h3>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li v-for="item in footerContactItems" :key="item.label" class="flex items-start gap-2">
              <component
                :is="resolveContactIcon(item.icon)"
                class="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <a
                v-if="item.href"
                :href="item.href"
                class="transition-colors duration-200 hover:text-foreground"
              >
                {{ item.label }}
              </a>
              <span v-else>{{ item.label }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Copyright {{ footerCurrentYear }} {{ footerBrandName }}. All rights reserved.</p>
        <div class="flex flex-wrap items-center gap-4">
          <a
            v-for="link in footerLegalLinks"
            :key="link.label"
            :href="link.href"
            class="transition-colors duration-200 hover:text-foreground"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
