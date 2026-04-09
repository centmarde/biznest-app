<script setup lang="ts">
import { ChevronRight, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographyP, TypographySmall } from '@/components/typography'
import { Separator } from '@/components/ui/separator'
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
</script>

<template>
  <aside class="flex h-full w-80 shrink-0 flex-col border-l">
    <Card class="flex h-full flex-col rounded-none border-0 shadow-none py-0">
      <CardHeader class="shrink-0 border-b py-4">
        <CardTitle class="flex items-center justify-between text-base">
          <TypographyP as="span" class="m-0 leading-none">Map Layer</TypographyP>
          <div class="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" title="Draw zone" @click="emit('start-draw-zone')">
              <Plus class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" @click="emit('close')">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent class="flex-1 space-y-4 overflow-y-auto p-4">
        <section class="space-y-2">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left"
            @click="showLayerList = !showLayerList"
          >
            <TypographySmall as="span" class="text-sm font-semibold">Zoning Layers</TypographySmall>
            <Badge variant="secondary" class="ml-auto">{{ layers.length }}</Badge>
            <ChevronRight
              class="h-4 w-4 transition-transform"
              :class="showLayerList ? 'rotate-90' : ''"
            />
          </button>



          <div v-if="showLayerList" class="space-y-2">
          <Button class="w-full" @click="openAddLayerModal">
            <Plus class="h-4 w-4" />
            <TypographySmall as="span">Add Zoning Layer</TypographySmall>
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
              <TypographySmall as="span" class="flex-1 truncate text-sm font-medium">{{ layer.title }}</TypographySmall>
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

            <LayerMappedZonesDropdown
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
