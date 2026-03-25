<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      class?: HTMLAttributes['class']
    }
  >(),
  {
    as: 'h1',
  },
)

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    data-slot="typography-h1"
    v-bind="delegatedProps"
    :class="
      cn(
        'scroll-m-20 text-6xl text-foreground font-semibold tracking-tight text-balance',
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
