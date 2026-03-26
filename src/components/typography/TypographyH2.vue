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
    as: 'h2',
  },
)

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    data-slot="typography-h2"
    v-bind="delegatedProps"
    :class="
      cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', props.class)
    "
  >
    <slot />
  </Primitive>
</template>
