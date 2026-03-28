<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ZoningLayerDeleteDialog from '@/views/admin/admin_map/components/ZoningLayerDeleteDialog.vue'
import ZoningLayerFormModal from '@/views/admin/admin_map/components/ZoningLayerFormModal.vue'
import type {
  CreateZoningLayerInput,
  MappedZone,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    layers: ZoningLayer[]
    mappedZones?: MappedZone[]
    isSubmitting?: boolean
  }>(),
  {
    mappedZones: () => [],
    isSubmitting: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-layer', payload: CreateZoningLayerInput): void
  (e: 'update-layer', payload: { layerId: string; input: UpdateZoningLayerInput }): void
  (e: 'delete-layer', layerId: string): void
  (e: 'toggle-layer-visibility', payload: { layerId: string; isActive: boolean }): void
}>()

const showAddLayerModal = ref(false)
const showLayerList = ref(false)
const showMappedZoneList = ref(false)
const showEditLayerModal = ref(false)
const deletingLayerId = ref<string | null>(null)
const editingLayerId = ref<string | null>(null)

const addLayerInitialValue = computed<UpdateZoningLayerInput>(() => ({
  title: '',
  color: '#65a30d',
  description: '',
}))

const editLayerInitialValue = computed<UpdateZoningLayerInput>(() => {
  const activeLayer = props.layers.find((layer) => layer.id === editingLayerId.value)

  if (!activeLayer) {
    return {
      title: '',
      color: '#65a30d',
      description: '',
    }
  }

  return {
    title: activeLayer.title,
    color: activeLayer.color,
    description: activeLayer.description ?? '',
  }
})

function openAddLayerModal(): void {
  showAddLayerModal.value = true
}

function closeAddLayerModal(): void {
  showAddLayerModal.value = false
}

function openEditLayerModal(layer: ZoningLayer): void {
  editingLayerId.value = layer.id
  showEditLayerModal.value = true
}

function closeEditLayerModal(): void {
  showEditLayerModal.value = false
  editingLayerId.value = null
}

function submitLayer(input: UpdateZoningLayerInput): void {
  emit('submit-layer', {
    title: input.title,
    color: input.color,
    description: input.description,
  })

  closeAddLayerModal()
}

function submitLayerUpdate(input: UpdateZoningLayerInput): void {
  if (!editingLayerId.value || props.isSubmitting) {
    return
  }

  emit('update-layer', {
    layerId: editingLayerId.value,
    input: {
      title: input.title,
      color: input.color,
      description: input.description,
    },
  })

  closeEditLayerModal()
}

function openDeleteDialog(layerId: string): void {
  deletingLayerId.value = layerId
}

function cancelDeleteDialog(): void {
  deletingLayerId.value = null
}

function confirmDeleteLayer(): void {
  if (!deletingLayerId.value || props.isSubmitting) {
    return
  }

  emit('delete-layer', deletingLayerId.value)
  cancelDeleteDialog()
}

function toggleLayerVisibility(layer: ZoningLayer): void {
  if (props.isSubmitting) {
    return
  }

  emit('toggle-layer-visibility', {
    layerId: layer.id,
    isActive: !layer.is_active,
  })
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
          <span>Map Layer</span>
          <Button variant="ghost" size="icon-sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-4 overflow-y-auto p-4">
        <section class="space-y-2">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left"
            @click="showLayerList = !showLayerList"
          >
            <p class="text-sm font-semibold">Zoning Layers</p>
            <Badge variant="secondary" class="ml-auto">{{ layers.length }}</Badge>
            <ChevronRight
              class="h-4 w-4 transition-transform"
              :class="showLayerList ? 'rotate-90' : ''"
            />
          </button>



          <div v-if="showLayerList" class="space-y-2">
          <Button class="w-full" @click="openAddLayerModal">
            <Plus class="h-4 w-4" />
            Add Zoning Layer
          </Button>

          <Separator />

          <div
            v-for="layer in layers"
            :key="layer.id"
            class="rounded-lg border p-2"
          >
            <div class="flex items-center gap-1">
              <span
                class="h-3 w-3 rounded-sm border"
                :style="{ backgroundColor: layer.color }"
              />
              <p class="flex-1 truncate text-sm font-medium">{{ layer.title }}</p>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Update layer"
                :disabled="isSubmitting"
                @click="openEditLayerModal(layer)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Delete layer"
                :disabled="isSubmitting"
                @click="openDeleteDialog(layer.id)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                :title="layer.is_active ? 'Hide layer zones' : 'Show layer zones'"
                :disabled="isSubmitting"
                @click="toggleLayerVisibility(layer)"
              >
                <Eye v-if="layer.is_active" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p v-if="layers.length === 0" class="text-xs text-muted-foreground">
            No zoning layers yet. Click Add Zoning Layer.
          </p>
          </div>
        </section>

        <Separator />

        <section class="space-y-2">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left"
            @click="showMappedZoneList = !showMappedZoneList"
          >
            <p class="text-sm font-semibold">Mapped Zones</p>
            <Badge variant="secondary" class="ml-auto">{{ mappedZones.length }}</Badge>
            <ChevronRight
              class="h-4 w-4 transition-transform"
              :class="showMappedZoneList ? 'rotate-90' : ''"
            />
          </button>



          <div v-if="showMappedZoneList" class="space-y-2">
            <div
              v-for="zone in mappedZones"
              :key="zone.id"
              class="rounded-lg border p-2"
            >
              <div class="flex items-center gap-2">
                <span
                  class="h-3 w-3 rounded-sm border"
                  :style="{ backgroundColor: zone.zoning_color }"
                />
                <p class="flex-1 truncate text-sm font-medium">{{ zone.name }}</p>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">{{ zone.zoning_title }}</p>
            </div>
            <p v-if="mappedZones.length === 0" class="text-xs text-muted-foreground">
              No mapped zones yet. Use Draw Zone to create one.
            </p>
          </div>
        </section>
      </CardContent>
    </Card>

    <ZoningLayerFormModal
      :open="showAddLayerModal"
      mode="add"
      :is-submitting="isSubmitting"
      :initial-value="addLayerInitialValue"
      @close="closeAddLayerModal"
      @submit="submitLayer"
    />

    <ZoningLayerFormModal
      :open="showEditLayerModal"
      mode="edit"
      :is-submitting="isSubmitting"
      :initial-value="editLayerInitialValue"
      @close="closeEditLayerModal"
      @submit="submitLayerUpdate"
    />

    <ZoningLayerDeleteDialog
      :open="Boolean(deletingLayerId)"
      :is-submitting="isSubmitting"
      @cancel="cancelDeleteDialog"
      @confirm="confirmDeleteLayer"
    />
  </aside>
</template>
