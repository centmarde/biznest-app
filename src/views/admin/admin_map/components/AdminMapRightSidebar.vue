<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Eye, Plus, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { CreateZoningLayerInput, ZoningLayer } from '@/types/zoning.types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    layers: ZoningLayer[]
    isSubmitting?: boolean
  }>(),
  {
    isSubmitting: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-layer', payload: CreateZoningLayerInput): void
}>()

const showAddLayerModal = ref(false)

const form = reactive<CreateZoningLayerInput>({
  title: '',
  color: '#65a30d',
  description: '',
})

const canSubmit = computed(() => form.title.trim().length > 0 && !props.isSubmitting)

function openAddLayerModal(): void {
  showAddLayerModal.value = true
}

function closeAddLayerModal(): void {
  showAddLayerModal.value = false
}

function submitLayer(): void {
  if (!canSubmit.value) {
    return
  }

  emit('submit-layer', {
    title: form.title.trim(),
    color: form.color,
    description: form.description.trim(),
  })

  form.title = ''
  form.description = ''
  form.color = '#65a30d'
  closeAddLayerModal()
}
</script>

<template>
  <aside
    v-if="isOpen"
    class="absolute right-3 top-3 z-9999 w-90 max-w-[calc(100%-1.5rem)]"
  >
    <Card class="max-h-[calc(100vh-10rem)] overflow-hidden py-0">
      <CardHeader class="border-b py-4">
        <CardTitle class="flex items-center justify-between text-base">
          <span>Zoning Layers</span>
          <Button variant="ghost" size="icon-sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-4 overflow-y-auto p-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold">Layer Controls</p>
            <Badge variant="secondary">{{ layers.length }}</Badge>
          </div>
          <Button class="w-full" @click="openAddLayerModal">
            <Plus class="h-4 w-4" />
            Add Zoning Layer
          </Button>
        </div>

        <Separator />

        <section class="space-y-2">
          <div
            v-for="layer in layers"
            :key="layer.id"
            class="rounded-lg border p-2"
          >
            <div class="flex items-center gap-2">
              <span
                class="h-3 w-3 rounded-sm border"
                :style="{ backgroundColor: layer.color }"
              />
              <p class="flex-1 truncate text-sm font-medium">{{ layer.title }}</p>
              <Button variant="ghost" size="icon-sm" title="Toggle visibility (next step)">
                <Eye class="h-4 w-4" />
              </Button>
            </div>
            <p v-if="layer.description" class="mt-1 text-xs text-muted-foreground">
              {{ layer.description }}
            </p>
          </div>
          <p v-if="layers.length === 0" class="text-xs text-muted-foreground">
            No zoning layers yet. Click Add Zoning Layer.
          </p>
        </section>
      </CardContent>
    </Card>

    <div
      v-if="showAddLayerModal"
      class="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4"
    >
      <Card class="w-full max-w-md py-0">
        <CardHeader class="border-b py-4">
          <CardTitle class="text-base">Add Zoning Layer</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 p-4">
          <div class="space-y-1">
            <label class="text-xs font-medium">Zoning Title</label>
            <Input v-model="form.title" placeholder="e.g. Residential" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Color</label>
            <Input v-model="form.color" type="color" class="h-10 w-14 p-1" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              placeholder="Short layer description"
            />
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="closeAddLayerModal">Cancel</Button>
            <Button :disabled="!canSubmit" @click="submitLayer">Save Layer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </aside>
</template>
