<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographyP, TypographySmall } from '@/components/typography'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAdminMapRightSidebar } from '@/views/(admin)/map/composables/useAdminMapRightSidebar'
import LayerMappedZonesDropdown from '@/views/(admin)/map/components/LayerMappedZonesDropdown.vue'
import MappedZoneFormModal from '@/views/(admin)/map/components/MappedZoneFormModal.vue'
import ZoningLayerDeleteDialog from '@/views/(admin)/map/components/ZoningLayerDeleteDialog.vue'
import ZoningLayerFormModal from '@/views/(admin)/map/components/ZoningLayerFormModal.vue'
import type {
  CreateZoningLayerInput,
  MappedZone,
  UpdateMappedZoneInput,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'

const props = withDefaults(
  defineProps<{
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
  (e: 'start-draw-zone'): void
  (e: 'submit-layer', payload: CreateZoningLayerInput): void
  (e: 'update-layer', payload: { layerId: string; input: UpdateZoningLayerInput }): void
  (e: 'delete-layer', layerId: string): void
  (e: 'update-mapped-zone', payload: { zoneId: string; input: UpdateMappedZoneInput }): void
  (e: 'delete-mapped-zone', zoneId: string): void
  (e: 'focus-mapped-zone', zoneId: string): void
  (e: 'toggle-layer-visibility', payload: { layerId: string; isActive: boolean }): void
}>()

const {
  addLayerInitialValue,
  closeAddLayerModal,
  closeEditLayerModal,
  closeEditMappedZoneModal,
  confirmDeleteLayer,
  confirmDeleteMappedZone,
  editLayerInitialValue,
  editMappedZoneInitialValue,
  focusMappedZone,
  openAddLayerModal,
  openDeleteDialog,
  openDeleteMappedZoneDialog,
  openEditLayerModal,
  openEditMappedZoneModal,
  submitLayer,
  submitLayerUpdate,
  submitMappedZoneUpdate,
  toggleLayerVisibility,
  cancelDeleteDialog,
  cancelDeleteMappedZoneDialog,
  deletingLayerId,
  deletingMappedZoneId,
  showAddLayerModal,
  showEditLayerModal,
  showEditMappedZoneModal,
  showLayerList,
} = useAdminMapRightSidebar(
  {
    layers: props.layers,
    mappedZones: props.mappedZones,
    isSubmitting: props.isSubmitting,
  },
  emit,
)

const expandedLayerIds = ref<Set<string>>(new Set())

function toggleLayerExpanded(layerId: string): void {
  const next = new Set(expandedLayerIds.value)

  if (next.has(layerId)) {
    next.delete(layerId)
  } else {
    next.add(layerId)
  }

  expandedLayerIds.value = next
}

function isLayerExpanded(layerId: string): boolean {
  return expandedLayerIds.value.has(layerId)
}

const mappedZoneCountByLayerId = computed<Record<string, number>>(() => {
  return props.mappedZones.reduce<Record<string, number>>((acc, zone) => {
    const current = acc[zone.zoning_layer_id] ?? 0
    acc[zone.zoning_layer_id] = current + 1
    return acc
  }, {})
})

const canStartDrawZone = computed(() => props.layers.length > 0 && !props.isSubmitting)

function handleStartDrawZone(): void {
  if (!canStartDrawZone.value) {
    return
  }

  emit('start-draw-zone')
}
</script>

<template>
  <aside class="flex h-full w-80 shrink-0 flex-col border-l">
    <Card class="flex h-full flex-col rounded-none border-0 shadow-none py-0">
      <CardHeader class="shrink-0 border-b py-4">
        <CardTitle class="flex items-center justify-between text-base">
          <div class="flex min-w-0 flex-1 items-center gap-2 text-left">
            <TypographyP as="span" class="m-0 leading-none">Zone Layer</TypographyP>
          </div>

          <div class="ml-3 flex items-center gap-1">
            <Badge variant="secondary">{{ layers.length }}</Badge>

            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Add zoning layer"
                    :disabled="isSubmitting"
                    @click="openAddLayerModal"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Add a new zoning layer</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="ghost" size="icon-sm" @click="emit('close')">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent class="flex-1 space-y-4 overflow-y-auto p-4">
        <div v-if="showLayerList" class="flex justify-end">
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <span
                  role="button"
                  tabindex="0"
                  class="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                  :class="canStartDrawZone ? 'cursor-pointer text-muted-foreground hover:text-foreground' : 'cursor-not-allowed text-muted-foreground/60'"
                  :aria-disabled="!canStartDrawZone"
                  @click="handleStartDrawZone"
                  @keydown.enter.prevent="handleStartDrawZone"
                  @keydown.space.prevent="handleStartDrawZone"
                >
                  <span class="text-lg font-bold leading-none transition-transform group-hover:-translate-y-px">+</span>
                  <span class="transition-colors group-hover:underline">Add Mapped Zone</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                Add a new mapped zone by drawing on the map.<br />
                <span class="font-semibold">Make sure to add a zone layer first before adding a mapped zone.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <section class="space-y-2">
          <div v-if="showLayerList" class="space-y-2">
          <div
            v-for="layer in layers"
            :key="layer.id"
            class="rounded-md"
          >
            <div class="w-full">
              <div class="w-full h-px bg-border/80" />
              <div class="flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50">
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-1 text-left"
                  :aria-expanded="isLayerExpanded(layer.id)"
                  :aria-controls="`mapped-zones-${layer.id}`"
                  @click="toggleLayerExpanded(layer.id)"
                >
                  <span
                    class="h-3 w-3 rounded-sm border"
                    :style="{ backgroundColor: layer.color }"
                  />
                  <TypographySmall as="span" class="flex-1 truncate text-sm font-medium">{{ layer.title }}</TypographySmall>
                  <Badge variant="secondary">{{ mappedZoneCountByLayerId[layer.id] ?? 0 }}</Badge>
                  <ChevronRight
                    class="h-3.5 w-3.5 transition-transform"
                    :class="isLayerExpanded(layer.id) ? 'rotate-90' : ''"
                  />
                </button>
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
              <div class="w-full h-px bg-border/80" />
            </div>

            <LayerMappedZonesDropdown
              v-if="isLayerExpanded(layer.id)"
              :id="`mapped-zones-${layer.id}`"
              :layer-id="layer.id"
              :mapped-zones="mappedZones"
              :is-submitting="isSubmitting"
              @update-mapped-zone="openEditMappedZoneModal"
              @delete-mapped-zone="openDeleteMappedZoneDialog"
              @select-mapped-zone="focusMappedZone"
            />
          </div>
          <TypographySmall v-if="layers.length === 0" as="p" class="text-xs text-muted-foreground">
            No zoning layers yet. Click Add Zoning Layer.
          </TypographySmall>
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

    <MappedZoneFormModal
      :open="showEditMappedZoneModal"
      mode="edit"
      :layers="layers"
      :is-submitting="isSubmitting"
      :initial-value="editMappedZoneInitialValue"
      @close="closeEditMappedZoneModal"
      @submit="submitMappedZoneUpdate"
    />

    <ZoningLayerDeleteDialog
      :open="Boolean(deletingMappedZoneId)"
      :is-submitting="isSubmitting"
      title="Delete Mapped Zone?"
      description="This action cannot be undone. This will permanently delete the selected mapped zone."
      confirm-label="Delete"
      @cancel="cancelDeleteMappedZoneDialog"
      @confirm="confirmDeleteMappedZone"
    />
  </aside>
</template>
