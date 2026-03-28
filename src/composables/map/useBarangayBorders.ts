import { ref } from 'vue'
import { fetchBarangayBordersSource } from '@/views/admin/admin_map/composables/barangayBordersSource'
import type {
  BarangayFeature,
  BarangayFeatureCollection,
  BarangayLngLat,
} from '@/types/map.types'

function isLngLat(value: unknown): value is BarangayLngLat {
  return (
    Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
  )
}

function isPolygonCoordinates(value: unknown): value is BarangayLngLat[][] {
  return Array.isArray(value) && value.every((ring) => Array.isArray(ring) && ring.every(isLngLat))
}

function isMultiPolygonCoordinates(value: unknown): value is BarangayLngLat[][][] {
  return (
    Array.isArray(value)
    && value.every((polygon) => Array.isArray(polygon) && polygon.every((ring) => Array.isArray(ring) && ring.every(isLngLat)))
  )
}

function normalizeBarangayFeatureCollection(raw: unknown): BarangayFeatureCollection {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Barangay border source is invalid')
  }

  const candidate = raw as { type?: unknown; features?: unknown }

  if (candidate.type !== 'FeatureCollection' || !Array.isArray(candidate.features)) {
    throw new Error('Barangay border source must be a GeoJSON FeatureCollection')
  }

  const features = candidate.features
    .map((feature): BarangayFeature | null => {
      if (typeof feature !== 'object' || feature === null) {
        return null
      }

      const typedFeature = feature as {
        type?: unknown
        geometry?: { type?: unknown; coordinates?: unknown } | null
        properties?: Record<string, unknown>
      }

      if (typedFeature.type !== 'Feature' || !typedFeature.geometry) {
        return null
      }

      const geometryType = typedFeature.geometry.type
      const geometryCoordinates = typedFeature.geometry.coordinates

      if (geometryType === 'Polygon' && isPolygonCoordinates(geometryCoordinates)) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: geometryCoordinates,
          },
          properties: typedFeature.properties,
        }
      }

      if (geometryType === 'MultiPolygon' && isMultiPolygonCoordinates(geometryCoordinates)) {
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: geometryCoordinates,
          },
          properties: typedFeature.properties,
        }
      }

      return null
    })
    .filter((feature): feature is BarangayFeature => feature !== null)

  return {
    type: 'FeatureCollection',
    features,
  }
}

export function useBarangayBorders() {
  const barangayBorders = ref<BarangayFeatureCollection | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function loadBarangayBorders(): Promise<void> {
    if (barangayBorders.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const raw = await fetchBarangayBordersSource()
      barangayBorders.value = normalizeBarangayFeatureCollection(raw)
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Unable to load barangay border map data.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    barangayBorders,
    isLoading,
    errorMessage,
    loadBarangayBorders,
  }
}
