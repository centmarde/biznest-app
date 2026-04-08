<!-- Map.vue -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BarangayFeatureCollection, MapProvider } from '@/types/map.types'
import type { Hazard } from '@/types/hazard.types'
import type { MapDrawPoint, MappedZone } from '@/types/zoning.types'
import { useGoogleMapAdapter } from '@/composables/map/useGoogleMapAdapter'
import { useLeafletMapAdapter } from '@/composables/map/useLeafletMapAdapter'
import 'leaflet/dist/leaflet.css'

defineOptions({
  name: 'AdminMapCanvas',
})

const props = withDefaults(
  defineProps<{
    provider?: MapProvider
    showBarangayBorders?: boolean
    barangayBorders?: BarangayFeatureCollection | null
    mappedZones?: MappedZone[]
    hazards?: Hazard[]
    showHazards?: boolean
    selectedHazardId?: string | null
    selectedMappedZoneId?: string | null
    drawPoints?: MapDrawPoint[]
    isDrawMode?: boolean
  }>(),
  {
    provider: 'leaflet',
    showBarangayBorders: false,
    barangayBorders: null,
    mappedZones: () => [],
    hazards: () => [],
    showHazards: false,
    selectedHazardId: null,
    selectedMappedZoneId: null,
    drawPoints: () => [],
    isDrawMode: false,
  },
)

const emit = defineEmits<{
  (e: 'map-click', point: MapDrawPoint): void
  (e: 'draw-point-move', index: number, point: MapDrawPoint): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref('')
const butuan = { lat: 8.9475, lng: 125.5406 }
const googleMapsApiKeyMeta = document.querySelector('meta[name="google-maps-api-key"]') as
  | HTMLMetaElement
  | null
const googleMapsApiKey = googleMapsApiKeyMeta?.content?.trim() ?? ''

function resolveGoogleMapsApiKey(): string {
  if (googleMapsApiKey.startsWith('%VITE_') && googleMapsApiKey.endsWith('%')) {
    return ''
  }

  return googleMapsApiKey
}

const googleMapAdapter = useGoogleMapAdapter({
  containerRef: mapContainer,
  center: butuan,
  mapId: 'DEMO_MAP_ID',
  getApiKey: resolveGoogleMapsApiKey,
})

const leafletMapAdapter = useLeafletMapAdapter({
  containerRef: mapContainer,
  center: butuan,
})

onMounted(async () => {
  await initProviderMap()
})

watch(
  () => props.provider,
  async () => {
    destroyProviderMaps()

    if (mapContainer.value) {
      mapContainer.value.innerHTML = ''
    }

    await nextTick()
    await initProviderMap()
  },
)

onBeforeUnmount(() => {
  destroyProviderMaps()
})

watch(
  () => [props.showBarangayBorders, props.barangayBorders],
  async () => {
    await renderBarangayBordersForActiveProvider()
  },
  { deep: true },
)

watch(
  () => props.mappedZones,
  async () => {
    await renderMappedZonesForActiveProvider()
  },
  { deep: true },
)

watch(
  () => [props.showHazards, props.hazards],
  async () => {
    await renderHazardsForActiveProvider()
  },
  { deep: true },
)

watch(
  () => props.drawPoints,
  async () => {
    await renderDrawPreviewForActiveProvider()
  },
  { deep: true },
)

watch(
  () => [props.selectedMappedZoneId, props.mappedZones],
  async () => {
    await focusSelectedMappedZoneForActiveProvider()
  },
  { deep: true },
)

watch(
  () => [props.selectedHazardId, props.hazards, props.showHazards],
  async () => {
    await focusSelectedHazardForActiveProvider()
  },
  { deep: true },
)

watch(
  () => props.isDrawMode,
  async () => {
    syncDrawModeForActiveProvider()
    syncMapClickHandlerForActiveProvider()
    syncDrawPointMoveHandlerForActiveProvider()
    await renderDrawPreviewForActiveProvider()
  },
)

function destroyProviderMaps(): void {
  leafletMapAdapter.destroy()
  googleMapAdapter.destroy()
}

async function renderBarangayBordersForActiveProvider(): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderBarangayBorders(
      Boolean(props.showBarangayBorders),
      props.barangayBorders ?? null,
    )
    return
  }

  await googleMapAdapter.renderBarangayBorders(
    Boolean(props.showBarangayBorders),
    props.barangayBorders ?? null,
  )
}

async function renderMappedZonesForActiveProvider(): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderMappedZones(props.mappedZones)
    return
  }

  await googleMapAdapter.renderMappedZones(props.mappedZones)
}

async function renderHazardsForActiveProvider(): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderHazards(Boolean(props.showHazards), props.hazards)
    return
  }

  await googleMapAdapter.renderHazards(Boolean(props.showHazards), props.hazards)
}

async function renderDrawPreviewForActiveProvider(): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderDrawPreview(props.drawPoints)
    return
  }

  await googleMapAdapter.renderDrawPreview(props.drawPoints)
}

async function focusSelectedMappedZoneForActiveProvider(): Promise<void> {
  if (!props.selectedMappedZoneId) {
    return
  }

  const selectedZone = props.mappedZones.find((zone) => zone.id === props.selectedMappedZoneId)
  if (!selectedZone || selectedZone.points.length === 0) {
    return
  }

  if (props.provider === 'leaflet') {
    await leafletMapAdapter.focusOnZone(selectedZone.points)
    return
  }

  await googleMapAdapter.focusOnZone(selectedZone.points)
}

function getHazardFocusPoints(hazard: Hazard): MapDrawPoint[] {
  if (hazard.geometry.type === 'Point') {
    const [lng, lat] = hazard.geometry.coordinates
    return [{ lat, lng }]
  }

  if (hazard.geometry.type === 'LineString') {
    return hazard.geometry.coordinates.map((point) => ({ lat: point[1], lng: point[0] }))
  }

  return hazard.geometry.coordinates.flatMap((ring) =>
    ring.map((point) => ({ lat: point[1], lng: point[0] })),
  )
}

async function focusSelectedHazardForActiveProvider(): Promise<void> {
  if (!props.showHazards || !props.selectedHazardId) {
    return
  }

  const selectedHazard = props.hazards.find((hazard) => hazard.id === props.selectedHazardId)
  if (!selectedHazard) {
    return
  }

  const focusPoints = getHazardFocusPoints(selectedHazard)
  if (focusPoints.length === 0) {
    return
  }

  if (props.provider === 'leaflet') {
    await leafletMapAdapter.focusOnZone(focusPoints)
    return
  }

  await googleMapAdapter.focusOnZone(focusPoints)
}

function syncMapClickHandlerForActiveProvider(): void {
  const handler = props.isDrawMode ? (point: MapDrawPoint) => emit('map-click', point) : null

  if (props.provider === 'leaflet') {
    leafletMapAdapter.setMapClickHandler(handler)
    googleMapAdapter.setMapClickHandler(null)
    return
  }

  googleMapAdapter.setMapClickHandler(handler)
  leafletMapAdapter.setMapClickHandler(null)
}

function syncDrawPointMoveHandlerForActiveProvider(): void {
  const handler = props.isDrawMode
    ? (index: number, point: MapDrawPoint) => emit('draw-point-move', index, point)
    : null

  if (props.provider === 'leaflet') {
    leafletMapAdapter.setDrawPointMoveHandler(handler)
    googleMapAdapter.setDrawPointMoveHandler(null)
    return
  }

  googleMapAdapter.setDrawPointMoveHandler(handler)
  leafletMapAdapter.setDrawPointMoveHandler(null)
}

function syncDrawModeForActiveProvider(): void {
  if (props.provider === 'leaflet') {
    leafletMapAdapter.setDrawMode(Boolean(props.isDrawMode))
    googleMapAdapter.setDrawMode(false)
    return
  }

  googleMapAdapter.setDrawMode(Boolean(props.isDrawMode))
  leafletMapAdapter.setDrawMode(false)
}

async function initProviderMap() {
  mapError.value = ''

  if (props.provider === 'leaflet') {
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ''
    }

    await leafletMapAdapter.init()
    await renderBarangayBordersForActiveProvider()
    await renderMappedZonesForActiveProvider()
    await renderHazardsForActiveProvider()
    await renderDrawPreviewForActiveProvider()
    await focusSelectedMappedZoneForActiveProvider()
    await focusSelectedHazardForActiveProvider()
    syncDrawModeForActiveProvider()
    syncMapClickHandlerForActiveProvider()
    syncDrawPointMoveHandlerForActiveProvider()
    return
  }

  try {
    await googleMapAdapter.init()
    await renderBarangayBordersForActiveProvider()
    await renderMappedZonesForActiveProvider()
    await renderHazardsForActiveProvider()
    await renderDrawPreviewForActiveProvider()
    await focusSelectedMappedZoneForActiveProvider()
    await focusSelectedHazardForActiveProvider()
    syncDrawModeForActiveProvider()
    syncMapClickHandlerForActiveProvider()
    syncDrawPointMoveHandlerForActiveProvider()
  } catch (error) {
    console.warn('Google Maps unavailable', error)

    if (mapContainer.value) {
      mapContainer.value.innerHTML = ''
    }

    if (error instanceof Error && error.message) {
      mapError.value = error.message
      return
    }

    mapError.value = 'Google Maps failed to load. Check API key, billing, and allowed referrers.'
  }
}
</script>

<template>
  <div class="relative w-full h-full">
    <div
      v-if="mapError"
      class="absolute left-3 top-3 z-50 rounded-md border border-destructive/45 bg-destructive/12 px-3 py-2 text-xs text-destructive shadow"
    >
      {{ mapError }}
    </div>
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<style scoped src="./Map.css"></style>
