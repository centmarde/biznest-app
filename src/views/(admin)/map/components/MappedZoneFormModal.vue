<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreateMappedZoneInput,
  UpdateMappedZoneInput,
  ZoningLayer,
} from '@/types/zoning.types'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode?: 'add' | 'edit'
    layers: ZoningLayer[]
    isSubmitting?: boolean
    pointCount?: number
    initialValue?: UpdateMappedZoneInput
  }>(),
  {
    mode: 'add',
    isSubmitting: false,
    pointCount: 0,
    initialValue: () => ({
      zoningLayerId: '',
      name: '',
      description: '',
    }),
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: Omit<CreateMappedZoneInput, 'points'>): void
}>()

const form = reactive({
  name: '',
  zoningLayerId: '',
  description: '',
})

const canSubmit = computed(() => {
  return form.name.trim().length > 0 && form.zoningLayerId.trim().length > 0 && !props.isSubmitting
})

const modalTitle = computed(() =>
  props.mode === 'add' ? 'Save Mapped Zone' : 'Update Mapped Zone',
)
const submitLabel = computed(() => (props.mode === 'add' ? 'Save Zone' : 'Update Zone'))

watch(
  () => [props.open, props.mode, props.initialValue],
  () => {
    const isOpen = props.open
    if (!isOpen) {
      return
    }

    if (props.mode === 'edit') {
      form.name = props.initialValue.name
      form.description = props.initialValue.description
      form.zoningLayerId = props.initialValue.zoningLayerId || props.layers[0]?.id || ''
      return
    }

    form.name = ''
    form.description = ''
    form.zoningLayerId = props.layers[0]?.id ?? ''
  },
  { immediate: true, deep: true },
)

watch(
  () => props.layers,
  (layers) => {
    if (!props.open) {
      return
    }

    const hasSelectedLayer = layers.some((layer) => layer.id === form.zoningLayerId)
    if (!hasSelectedLayer) {
      form.zoningLayerId = layers[0]?.id ?? ''
    }
  },
  { deep: true },
)

function submit(): void {
  if (!canSubmit.value) {
    return
  }

  emit('submit', {
    name: form.name.trim(),
    zoningLayerId: form.zoningLayerId,
    description: form.description.trim(),
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4">
    <Card class="w-full max-w-md py-0">
      <CardHeader class="border-b py-4">
        <CardTitle class="text-base">{{ modalTitle }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 p-4">
        <p v-if="mode === 'add'" class="text-xs text-muted-foreground">
          {{ pointCount }} polygon points captured.
        </p>

        <div class="space-y-1">
          <label class="text-xs font-medium">Mapped Zone Name</label>
          <Input v-model="form.name" placeholder="e.g. North Trade Zone" />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium">Zoning Type</label>
          <Select v-model="form.zoningLayerId">
            <SelectTrigger>
              <SelectValue placeholder="Select zoning layer" />
            </SelectTrigger>
            <SelectContent class="z-10002">
              <SelectItem v-for="layer in layers" :key="layer.id" :value="layer.id">
                {{ layer.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium">Description (Optional)</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
            placeholder="Describe this mapped zone"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="emit('close')">Cancel</Button>
          <Button :disabled="!canSubmit" @click="submit">{{ submitLabel }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
