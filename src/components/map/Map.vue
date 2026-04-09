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
  }>(),
  {
    provider: 'leaflet',
  },
)

const emit = defineEmits<{
  (e: 'ready'): void
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

function destroyProviderMaps(): void {
  leafletMapAdapter.destroy()
  googleMapAdapter.destroy()
}

async function initProviderMap(): Promise<void> {
  mapError.value = ''

  if (props.provider === 'leaflet') {
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ''
    }
    await leafletMapAdapter.init()
    emit('ready')
    return
  }

  try {
    await googleMapAdapter.init()
    emit('ready')
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

// ── Imperative render API (called by parent via template ref) ──────────────

async function renderBarangayBorders(
  show: boolean,
  borders: BarangayFeatureCollection | null,
): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderBarangayBorders(show, borders)
    return
  }
  await googleMapAdapter.renderBarangayBorders(show, borders)
}

async function renderMappedZones(zones: MappedZone[]): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderMappedZones(zones)
    return
  }
  await googleMapAdapter.renderMappedZones(zones)
}

async function renderHazards(show: boolean, hazards: Hazard[]): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderHazards(show, hazards)
    return
  }
  await googleMapAdapter.renderHazards(show, hazards)
}

async function renderDrawPreview(points: MapDrawPoint[]): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.renderDrawPreview(points)
    return
  }
  await googleMapAdapter.renderDrawPreview(points)
}

async function focusOnZone(points: MapDrawPoint[]): Promise<void> {
  if (props.provider === 'leaflet') {
    await leafletMapAdapter.focusOnZone(points)
    return
  }
  await googleMapAdapter.focusOnZone(points)
}

function setDrawMode(enabled: boolean): void {
  if (props.provider === 'leaflet') {
    leafletMapAdapter.setDrawMode(enabled)
    googleMapAdapter.setDrawMode(false)
    return
  }
  googleMapAdapter.setDrawMode(enabled)
  leafletMapAdapter.setDrawMode(false)
}

function setMapClickHandler(handler: ((point: MapDrawPoint) => void) | null): void {
  if (props.provider === 'leaflet') {
    leafletMapAdapter.setMapClickHandler(handler)
    googleMapAdapter.setMapClickHandler(null)
    return
  }
  googleMapAdapter.setMapClickHandler(handler)
  leafletMapAdapter.setMapClickHandler(null)
}

function setDrawPointMoveHandler(
  handler: ((index: number, point: MapDrawPoint) => void) | null,
): void {
  if (props.provider === 'leaflet') {
    leafletMapAdapter.setDrawPointMoveHandler(handler)
    googleMapAdapter.setDrawPointMoveHandler(null)
    return
  }
  googleMapAdapter.setDrawPointMoveHandler(handler)
  leafletMapAdapter.setDrawPointMoveHandler(null)
}

defineExpose({
  renderBarangayBorders,
  renderMappedZones,
  renderHazards,
  renderDrawPreview,
  focusOnZone,
  setDrawMode,
  setMapClickHandler,
  setDrawPointMoveHandler,
})
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
