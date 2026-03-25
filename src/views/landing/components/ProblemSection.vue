<script setup lang="ts">
defineOptions({
  name: 'ProblemSection',
})

const oldWayPoints: string[] = [
  'Choosing locations by foot traffic alone often leads to expensive guesswork.',
  'A single wrong location decision can stall growth and burn precious runway.',
  'Manual research across maps, permits, and demographics is slow and exhausting.',
]

const bizNestWayPoints: string[] = [
  'AI-backed market data highlights where demand, competition, and opportunity align.',
  'Tailored location scoring ranks the best spots for your exact business profile.',
  'Instant local business connections help you partner, grow, and launch with confidence.',
]
</script>

<template>
  <section class="w-full bg-foreground/5 py-20 md:py-28">
    <div class="mx-auto w-full max-w-screen-xl px-6 md:px-10">
      <!-- Heading -->
      <div class="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <h2 class="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          Finding a profitable location is usually a guessing game.
          <span class="text-accent"> We turned it into a science.</span>
        </h2>
      </div>

      <!-- Cards -->
      <div class="grid gap-4 md:grid-cols-2 md:gap-5">
        <!-- Problem Card -->
        <article
          class="group relative overflow-hidden rounded-2xl border border-red-500/15 bg-background/80 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8"
        >
          <!-- Ambient glow blob -->
          <div
            class="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-red-500/10 blur-3xl group-hover:bg-red-500/[0.14] transition-colors duration-500"
          />

          <div class="relative">
            <span
              class="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/[0.08] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-red-400"
            >
              The Problem
            </span>
            <h3 class="mt-5 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              The Old Way
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-foreground/55 md:text-base">
              Founders are forced to make one of their biggest decisions with incomplete signals,
              intuition, and too much risk.
            </p>

            <ul class="mt-7 space-y-4">
              <li v-for="point in oldWayPoints" :key="point" class="flex items-start gap-3">
                <span
                  class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/70 shadow-[0_0_6px_2px_rgba(239,68,68,0.45)]"
                />
                <span class="text-sm leading-relaxed text-foreground/65 md:text-base">{{
                  point
                }}</span>
              </li>
            </ul>
          </div>
        </article>

        <!-- Solution Card -->
        <article
          class="group relative overflow-hidden rounded-2xl border border-primary/20 bg-background/90 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8"
        >
          <!-- Ambient glow blob -->
          <div
            class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/[0.15] transition-colors duration-500"
          />

          <div class="relative">
            <span
              class="inline-flex items-center rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-primary"
            >
              The Solution
            </span>
            <h3 class="mt-5 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              The BizNest Way
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-foreground/55 md:text-base">
              BizNest gives founders a data-first system for location strategy so every move is
              faster, clearer, and more confident.
            </p>

            <ul class="mt-7 space-y-4">
              <li v-for="point in bizNestWayPoints" :key="point" class="flex items-start gap-3">
                <span
                  class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80 shadow-[0_0_6px_2px_hsl(var(--primary)/0.45)]"
                />
                <span class="text-sm leading-relaxed text-foreground/65 md:text-base">{{
                  point
                }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
