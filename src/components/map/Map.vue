<!-- Map.vue -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import type { Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"

defineOptions({
  name: "AdminMapCanvas",
})

type MapProvider = "google" | "leaflet"

const props = withDefaults(
  defineProps<{
    provider?: MapProvider
  }>(),
  {
    provider: "leaflet",
  },
)

type GoogleMapInstance = {
  setCenter: (latLng: { lat: number; lng: number }) => void
}

type GoogleMapCtor = new (
  element: HTMLElement,
  options: { center: { lat: number; lng: number }; zoom: number; mapId?: string },
) => GoogleMapInstance

type AdvancedMarkerLibrary = {
  AdvancedMarkerElement: new (options: {
    position: { lat: number; lng: number }
    map: GoogleMapInstance
    title?: string
  }) => unknown
}

type LegacyMarkerCtor = new (options: {
  position: { lat: number; lng: number }
  map: GoogleMapInstance
  title?: string
}) => unknown

type GoogleMapsAPI = {
  Map?: GoogleMapCtor
  Marker?: LegacyMarkerCtor
  importLibrary?: (name: string) => Promise<unknown>
  marker?: {
    AdvancedMarkerElement?: AdvancedMarkerLibrary["AdvancedMarkerElement"]
  }
}

type MapsLibrary = {
  Map: GoogleMapCtor
}

type GoogleWindow = Window & {
  google?: {
    maps?: GoogleMapsAPI
  }
}

const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref("")
const butuan = { lat: 8.9475, lng: 125.5406 }
const googleMapsApiKeyMeta = document.querySelector('meta[name="google-maps-api-key"]') as
  | HTMLMetaElement
  | null
const googleMapsApiKey = googleMapsApiKeyMeta?.content?.trim() ?? ""
const resolvedGoogleMapsApiKey =
  googleMapsApiKey.startsWith("%VITE_") && googleMapsApiKey.endsWith("%") ? "" : googleMapsApiKey
let googleMapsLoader: Promise<void> | null = null
let leafletMap: LeafletMap | null = null

onMounted(async () => {
  await initProviderMap()
})

watch(
  () => props.provider,
  async () => {
    destroyLeafletMap()

    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }

    await nextTick()
    await initProviderMap()
  },
)

onBeforeUnmount(() => {
  destroyLeafletMap()
})

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadGoogleMaps(): Promise<void> {
  const googleWindow = window as GoogleWindow

  if (!resolvedGoogleMapsApiKey) {
    return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"))
  }

  if (googleWindow.google?.maps) {
    return Promise.resolve()
  }

  if (googleMapsLoader) {
    return googleMapsLoader
  }

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-sdk") as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")), {
        once: true,
      })
      return
    }

    const script = document.createElement("script")
    script.id = "google-maps-sdk"
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${resolvedGoogleMapsApiKey}&loading=async&libraries=marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google Maps failed to load"))
    document.head.appendChild(script)
  })

  return googleMapsLoader
}

async function initGoogleMap(): Promise<boolean> {
  if (!mapContainer.value) return false

  const googleWindow = window as GoogleWindow
  const googleMaps = googleWindow.google?.maps

  if (!googleMaps) {
    return false
  }

  let MapCtor: GoogleMapCtor | undefined
  let AdvancedMarkerElement: AdvancedMarkerLibrary["AdvancedMarkerElement"] | undefined

  if (typeof googleMaps.Map === "function") {
    MapCtor = googleMaps.Map
  }

  if (!MapCtor && typeof googleMaps.importLibrary === "function") {
    const mapsLibrary = (await googleMaps.importLibrary("maps")) as unknown as MapsLibrary
    if (typeof mapsLibrary.Map === "function") {
      MapCtor = mapsLibrary.Map
    }
  }

  if (typeof googleMaps.importLibrary === "function") {
    const markerLibrary = (await googleMaps.importLibrary("marker")) as unknown as AdvancedMarkerLibrary
    AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
  } else {
    AdvancedMarkerElement = googleMaps.marker?.AdvancedMarkerElement
  }

  if (!MapCtor) return false

  const map = new MapCtor(mapContainer.value, {
    center: butuan,
    zoom: 14,
    mapId: "DEMO_MAP_ID",
  })

  if (AdvancedMarkerElement) {
    new AdvancedMarkerElement({
      position: butuan,
      map,
      title: "Butuan City",
    })
    return true
  }

  if (googleMaps.Marker) {
    console.warn("AdvancedMarkerElement is unavailable; falling back to legacy Marker")
    new googleMaps.Marker({
      position: butuan,
      map,
      title: "Butuan City",
    })
    return true
  }

  return true
}

async function initLeafletMap() {
  if (!mapContainer.value) return

  const L = await import("leaflet")

  leafletMap = L.map(mapContainer.value).setView([butuan.lat, butuan.lng], 14)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(leafletMap)

  L.marker([butuan.lat, butuan.lng]).addTo(leafletMap).bindPopup("Butuan City")
}

function destroyLeafletMap() {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
}

async function initProviderMap() {
  mapError.value = ""

  if (props.provider === "leaflet") {
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }
    await initLeafletMap()
    return
  }

  try {
    await loadGoogleMaps()
    let initialized = false

    // On hard refresh, Google Maps may report loaded before constructors are ready.
    for (let attempt = 0; attempt < 6 && !initialized; attempt += 1) {
      initialized = await initGoogleMap()

      if (!initialized) {
        await delay(200)
      }
    }

    if (!initialized) {
      mapError.value = "Google Maps could not be initialized. Check API key and Google Cloud restrictions."
    }
  } catch (error) {
    console.warn("Google Maps unavailable", error)
    if (mapContainer.value) {
      mapContainer.value.innerHTML = ""
    }
    mapError.value = "Google Maps failed to load. Check API key, billing, and allowed referrers."
  }
}
</script>

<template>
  <div class="relative w-full h-full">
    <div
      v-if="mapError"
      class="absolute left-3 top-3 z-50 rounded-md bg-red-100 px-3 py-2 text-xs text-red-800 shadow"
    >
      {{ mapError }}
    </div>
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>
