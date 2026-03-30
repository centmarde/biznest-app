<script setup lang="ts">
import type { Component } from 'vue'
import { Handshake, MapPin, Sparkles } from 'lucide-vue-next'
import TypographyH2 from '@/components/typography/TypographyH2.vue'
import TypographyLarge from '@/components/typography/TypographyLarge.vue'
import TypographyMuted from '@/components/typography/TypographyMuted.vue'
import TypographySmall from '@/components/typography/TypographySmall.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { StepGuideItem, StepIcon } from '../types/steps.types'
import { stepGuideItems, stepVisualMap } from '../utils/steps'

defineOptions({
  name: 'StepsSection',
})

const iconMap: Record<StepIcon, Component> = {
  'map-pin': MapPin,
  sparkles: Sparkles,
  handshake: Handshake,
}

const resolveIcon = (icon: StepGuideItem['icon']): Component => iconMap[icon]
const resolveIconBadgeClass = (icon: StepGuideItem['icon']): string => stepVisualMap[icon].iconBadge
const resolveCardHoverClass = (icon: StepGuideItem['icon']): string => stepVisualMap[icon].cardHover
</script>

<template>
  <section class="w-full bg-far py-14 md:py-20">
    <div class="mx-auto w-full max-w-screen-xl px-6 md:px-10">
      <!-- Heading -->
      <div class="mx-auto mb-14 max-w-4xl text-center md:mb-16">
        <TypographySmall as="p" class="mb-3 uppercase tracking-[0.2em] text-muted-foreground">
          Your Roadmap
        </TypographySmall>
        <TypographyH2 as="h2" class="border-0 pb-0 text-balance">
          Go from business idea to the right location in 3 smart steps
        </TypographyH2>
        <TypographyMuted class="mx-auto mt-2 max-w-2xl text-base leading-relaxed md:text-lg">
          BizNest helps you decide, validate, and connect, so your next move is guided by data
          instead of guesswork.
        </TypographyMuted>
      </div>

      <!-- Step Cards -->
      <div class="grid gap-4 md:grid-cols-3 md:gap-5">
        <Card
          v-for="item in stepGuideItems"
          :key="item.step"
          :class="[
            'group h-full border-border/80 bg-card/95 transition-all duration-300 hover:-translate-y-1',
            resolveCardHoverClass(item.icon),
          ]"
        >
          <CardHeader class="gap-4 pb-2">
            <div class="flex items-center justify-between gap-3">
              <div
                :class="[
                  'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300',
                  resolveIconBadgeClass(item.icon),
                ]"
              >
                <component
                  :is="resolveIcon(item.icon)"
                  class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />
              </div>
              <TypographySmall as="span" class="uppercase tracking-wider text-muted-foreground">
                {{ item.step }}
              </TypographySmall>
            </div>
            <TypographyLarge as="h3" class="text-xl leading-tight md:text-2xl">
              {{ item.title }}
            </TypographyLarge>
          </CardHeader>

          <CardContent class="space-y-3">
            <TypographyMuted class="text-sm leading-relaxed md:text-base text-muted-foreground">
              {{ item.description }}
            </TypographyMuted>
            <TypographySmall as="p" class="text-primary/90">
              {{ item.hint }}
            </TypographySmall>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
