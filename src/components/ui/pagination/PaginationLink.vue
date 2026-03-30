<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { ButtonVariants } from '@/components/ui/button'

interface Props extends PrimitiveProps {
  isActive?: boolean
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'a',
  isActive: false,
  size: 'icon',
})
</script>

<template>
  <Primitive
    data-slot="pagination-link"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        props.class,
      )
    "
    :aria-current="isActive ? 'page' : undefined"
  >
    <slot />
  </Primitive>
</template>
