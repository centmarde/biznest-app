
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Layers, PenTool } from 'lucide-vue-next'
import Map from '@/components/map/Map.vue'
import { useBarangayBorders } from '@/composables/map/useBarangayBorders'
import AdminMapRightSidebar from '@/views/admin/admin_map/components/AdminMapRightSidebar.vue'
import MappedZoneFormModal from '@/views/admin/admin_map/components/MappedZoneFormModal.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createMappedZone,
  createZoningLayer,
  deleteZoningLayer,
  listMyMappedZones,
  listMyZoningLayers,
  setZoningLayerActive,
  updateZoningLayer,
} from '@/services/zoning/zoning.service'
import type {
  CreateMappedZoneInput,
  CreateZoningLayerInput,
  MappedZone,
  MapDrawPoint,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types'

const provider = ref<'google' | 'leaflet'>('leaflet')
const showBarangayBorders = ref(false)
const isSidebarOpen = ref(false)
const isSavingLayer = ref(false)
const isSavingMappedZone = ref(false)
const isDrawMode = ref(false)
const drawPoints = ref<MapDrawPoint[]>([])
const showMappedZoneModal = ref(false)
const zoningLayers = ref<ZoningLayer[]>([])
const mappedZones = ref<MappedZone[]>([])
const zoningError = ref('')

const visibleMappedZones = computed(() => {
  const activeLayerIds = new Set(
    zoningLayers.value
      .filter((layer) => layer.is_active)
      .map((layer) => layer.id),
  )

  return mappedZones.value.filter(
    (zone) => zone.is_visible && activeLayerIds.has(zone.zoning_layer_id),
  )
})

const { barangayBorders, isLoading, errorMessage, loadBarangayBorders } = useBarangayBorders()

onMounted(async () => {
  await loadZoningLayers()
  await loadMappedZones()
})

async function toggleBarangayBorders() {
  if (!showBarangayBorders.value) {
    await loadBarangayBorders()
  }

  showBarangayBorders.value = !showBarangayBorders.value
}

async function loadZoningLayers(): Promise<void> {
  zoningError.value = ''
  try {
    zoningLayers.value = await listMyZoningLayers()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to load zoning layers.'
  }
}

async function loadMappedZones(): Promise<void> {
  zoningError.value = ''
  try {
    mappedZones.value = await listMyMappedZones()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to load mapped zones.'
  }
}

async function handleCreateLayer(payload: CreateZoningLayerInput): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const createdLayer = await createZoningLayer(payload)
    zoningLayers.value = [createdLayer, ...zoningLayers.value]
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to save zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleUpdateLayer(payload: {
  layerId: string
  input: UpdateZoningLayerInput
}): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const updatedLayer = await updateZoningLayer(payload.layerId, payload.input)
    zoningLayers.value = zoningLayers.value.map((layer) => {
      if (layer.id !== updatedLayer.id) {
        return layer
      }

      return updatedLayer
    })
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to update zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleDeleteLayer(layerId: string): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    await deleteZoningLayer(layerId)
    zoningLayers.value = zoningLayers.value.filter((layer) => layer.id !== layerId)
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to delete zoning layer.'
  } finally {
    isSavingLayer.value = false
  }
}

async function handleToggleLayerVisibility(payload: {
  layerId: string
  isActive: boolean
}): Promise<void> {
  isSavingLayer.value = true
  zoningError.value = ''

  try {
    const updatedLayer = await setZoningLayerActive(payload.layerId, payload.isActive)
    zoningLayers.value = zoningLayers.value.map((layer) => {
      if (layer.id !== updatedLayer.id) {
        return layer
      }

      return updatedLayer
    })
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to toggle layer visibility.'
  } finally {
    isSavingLayer.value = false
  }
}

function startDrawZoneMode(): void {
  if (zoningLayers.value.length === 0) {
    zoningError.value = 'Please add at least one zoning layer before drawing a zone.'
    return
  }

  zoningError.value = ''
  drawPoints.value = []
  isDrawMode.value = true
}

function handleMapClick(point: MapDrawPoint): void {
  if (!isDrawMode.value) {
    return
  }

  drawPoints.value = [...drawPoints.value, point]
}

function cancelDrawZoneMode(): void {
  isDrawMode.value = false
  drawPoints.value = []
  showMappedZoneModal.value = false
}

function finishDrawZoneMode(): void {
  if (drawPoints.value.length < 3) {
    zoningError.value = 'Draw at least 3 points to create a polygon.'
    return
  }

  showMappedZoneModal.value = true
}

async function handleSaveMappedZone(
  payload: Omit<CreateMappedZoneInput, 'points'>,
): Promise<void> {
  isSavingMappedZone.value = true
  zoningError.value = ''

  try {
    await createMappedZone({
      ...payload,
      points: drawPoints.value,
    })

    await loadMappedZones()
    cancelDrawZoneMode()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to save mapped zone.'
  } finally {
    isSavingMappedZone.value = false
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col gap-3 p-3">
    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm font-medium">Map Provider</label>
      <Select v-model="provider">
        <SelectTrigger class="w-60">
          <SelectValue placeholder="Select map provider" />
        </SelectTrigger>
        <SelectContent style="z-index: 9999">
          <SelectItem value="leaflet">Leaflet OpenStreetMap</SelectItem>
          <SelectItem value="google">Google Maps</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" :disabled="isLoading" @click="toggleBarangayBorders">
        {{ showBarangayBorders ? 'Hide Barangay Border' : 'Show Barangay Border' }}
      </Button>

      <Button variant="outline" @click="startDrawZoneMode">
        <PenTool class="h-4 w-4" />
        Draw Zone
      </Button>

      <span v-if="isLoading" class="text-xs text-muted-foreground">Loading barangay borders...</span>
      <span v-if="errorMessage" class="text-xs text-destructive">{{ errorMessage }}</span>
    </div>

    <div class="relative flex-1 min-h-0">
      <Map
        :provider="provider"
        :show-barangay-borders="showBarangayBorders"
        :barangay-borders="barangayBorders"
        :mapped-zones="visibleMappedZones"
        :draw-points="drawPoints"
        :is-draw-mode="isDrawMode"
        @map-click="handleMapClick"
      />

      <Button
        variant="secondary"
        class="absolute right-3 top-3 z-9998"
        @click="isSidebarOpen = true"
      >
        <Layers class="h-4 w-4" />
        Layers
      </Button>

      <AdminMapRightSidebar
        :is-open="isSidebarOpen"
        :layers="zoningLayers"
        :mapped-zones="mappedZones"
        :is-submitting="isSavingLayer"
        @close="isSidebarOpen = false"
        @submit-layer="handleCreateLayer"
        @update-layer="handleUpdateLayer"
        @delete-layer="handleDeleteLayer"
        @toggle-layer-visibility="handleToggleLayerVisibility"
      />

      <div
        v-if="isDrawMode"
        class="absolute left-3 top-3 z-9999 rounded-md border bg-card/95 px-3 py-2 text-xs shadow"
      >
        <p class="font-medium">Draw Mode Active</p>
        <p class="text-muted-foreground">{{ drawPoints.length }} points</p>
        <div class="mt-2 flex gap-2">
          <Button size="sm" variant="outline" @click="cancelDrawZoneMode">Cancel</Button>
          <Button size="sm" :disabled="drawPoints.length < 3" @click="finishDrawZoneMode">
            Save Polygon
          </Button>
        </div>
      </div>

      <div
        v-if="zoningError"
        class="absolute bottom-3 left-3 z-9999 rounded-md border border-destructive/45 bg-destructive/12 px-3 py-2 text-xs text-destructive shadow"
      >
        {{ zoningError }}
      </div>

      <MappedZoneFormModal
        :open="showMappedZoneModal"
        :layers="zoningLayers"
        :is-submitting="isSavingMappedZone"
        :point-count="drawPoints.length"
        @close="showMappedZoneModal = false"
        @submit="handleSaveMappedZone"
      />
    </div>
  </div>
</template>
