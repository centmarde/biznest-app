<!-- Map.vue -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BarangayFeatureCollection, MapProvider } from '@/types/map.types'
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
  }>(),
  {
    provider: 'leaflet',
    showBarangayBorders: false,
    barangayBorders: null,
  },
)

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

async function initProviderMap() {
  mapError.value = ''

  if (props.provider === 'leaflet') {
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ''
    }

    await leafletMapAdapter.init()
    await renderBarangayBordersForActiveProvider()
    return
  }

  try {
    await googleMapAdapter.init()
    await renderBarangayBordersForActiveProvider()
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
