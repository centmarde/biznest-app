<script setup lang="ts">
import { oldWayPoints, bizNestWayPoints } from '../utils/problem'

defineOptions({
  name: 'ProblemSection',
})

import TypographyH2 from '@/components/typography/TypographyH2.vue'
import TypographyH3 from '@/components/typography/TypographyH3.vue'
import TypographyMuted from '@/components/typography/TypographyMuted.vue'
import TypographySmall from '@/components/typography/TypographySmall.vue'
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <section class="w-full bg-background py-14 md:py-20">
    <div class="mx-auto w-full max-w-screen-xl px-6 md:px-10">
      <!-- Heading -->
      <div class="mx-auto mb-14 max-w-4xl text-center md:mb-16">
        <TypographyH2>
          Finding a profitable location is usually a guessing game. <br />
          <TypographyMuted as="span" class="inline text-inherit text-accent text-4xl"
            >We turned it into a science.</TypographyMuted
          >
        </TypographyH2>
      </div>

      <!-- Cards -->
      <div class="grid gap-4 md:grid-cols-2 md:gap-5">
        <!-- Problem Card (The Old Way) -->
        <article
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8"
        >
          <!-- Top Row: icon + chart illustration -->
          <div class="mb-6 flex items-start justify-between">
            <!-- Icon box -->
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/8 border border-destructive/15"
            >
              <svg
                class="h-7 w-7 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z"
                />
              </svg>
            </div>

            <!-- Mini chart illustration -->
            <div class="relative flex gap-2 opacity-50">
              <div class="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                <svg class="h-10 w-16 text-destructive/80" viewBox="0 0 64 40">
                  <polyline
                    points="4,32 16,20 28,26 40,10 52,18 60,8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div
                class="absolute -bottom-3 right-0 rounded-xl border border-border bg-background px-3 py-2 shadow-sm"
              >
                <svg class="h-8 w-14 text-destructive/50" viewBox="0 0 56 32">
                  <polyline
                    points="4,24 14,18 24,22 36,10 48,16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Label -->
          <TypographySmall
            as="p"
            class="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground"
          >
            The Old Way
          </TypographySmall>

          <!-- Title row -->
          <div class="mt-3 flex items-center gap-2.5">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold leading-none"
              >✕</span
            >
            <TypographyH3> Stressful &amp; Manual Guessing </TypographyH3>
          </div>

          <!-- Bullet list -->
          <ul class="mt-6 space-y-3">
            <li v-for="point in oldWayPoints" :key="point" class="flex items-start gap-3">
              <span
                class="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center text-destructive font-bold text-sm leading-none"
                >✕</span
              >
              <TypographyMuted
                as="span"
                class="text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]"
                >{{ point }}</TypographyMuted
              >
            </li>
          </ul>
        </article>

        <!-- Solution Card (The BizNest Way) -->
        <article
          class="group relative overflow-hidden rounded-2xl border-2 border-success bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8"
        >
          <!-- Top Row: icon + solution badge -->
          <div class="mb-6 flex items-start justify-between">
            <!-- App icon box -->
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl border border-success/25 bg-success/12"
            >
              <svg
                class="h-7 w-7 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
            </div>

            <!-- "the Solution" pill -->
            <span class="inline-flex items-center rounded-full bg-success px-5 py-1.5 shadow-sm">
              <TypographySmall as="span" class="font-semibold text-success-foreground"
                >the Solution</TypographySmall
              >
            </span>
          </div>

          <!-- Label -->
          <TypographySmall
            as="p"
            class="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground"
          >
            The BizNest Way
          </TypographySmall>

          <!-- Title row -->
          <div class="mt-3 flex items-center gap-2.5">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success text-success-foreground text-xs font-bold leading-none"
              >✓</span
            >
            <TypographyH3> AI-Powered, Data-Driven Decisions </TypographyH3>
          </div>

          <!-- Bullet list -->
          <ul class="mt-6 space-y-3">
            <li v-for="point in bizNestWayPoints" :key="point" class="flex items-start gap-3">
              <span
                class="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center text-success font-bold text-sm leading-none"
                >✓</span
              >
              <TypographyMuted
                as="span"
                class="text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]"
                >{{ point }}</TypographyMuted
              >
            </li>
          </ul>
        </article>
      </div>

      <!-- CTA Buttons -->
      <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button>
          <TypographySmall as="span" class="text-current text-md leading-none"
            >See How It Works</TypographySmall
          >
        </Button>
        <Button variant="ghost">
          <TypographySmall as="span" class="text-current text-md leading-none"
            >Start Finding Locations</TypographySmall
          >
        </Button>
      </div>
    </div>
  </section>
</template>
