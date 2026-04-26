import { getSupabaseClient } from '@/services/supabase.client'
import {
  fetchBarangayBordersSourceByCity,
  resolveGeoRiskCityName,
} from '@/views/(admin)/map/composables/barangayBordersSource'
import type { BarangayFeature, BarangayFeatureCollection, BarangayLngLat } from '@/types/map.types'

interface UserCityLookupResult {
  geoRiskCityName: string
  borders: BarangayFeatureCollection
}

function isLngLat(value: unknown): value is BarangayLngLat {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

function isPolygonCoordinates(value: unknown): value is BarangayLngLat[][] {
  return Array.isArray(value) && value.every((ring) => Array.isArray(ring) && ring.every(isLngLat))
}

function isMultiPolygonCoordinates(value: unknown): value is BarangayLngLat[][][] {
  return (
    Array.isArray(value) &&
    value.every(
      (polygon) =>
        Array.isArray(polygon) &&
        polygon.every((ring) => Array.isArray(ring) && ring.every(isLngLat)),
    )
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

export async function resolveCurrentGeoRiskCityName(): Promise<string> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Unable to resolve your account city. Please sign in again.')
  }

  const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>

  const cityName =
    typeof metadata.city_name === 'string'
      ? metadata.city_name
      : typeof metadata.city === 'string'
        ? metadata.city
        : null

  const legacyCity = typeof metadata.city === 'string' ? metadata.city : null

  const resolved = await resolveGeoRiskCityName({
    cityName,
    legacyCity,
  })

  if (!resolved) {
    throw new Error(
      cityName
        ? `No matching GeoRisk city found for "${cityName}".`
        : 'No city name found in your account metadata.',
    )
  }

  return resolved
}

export async function fetchNormalizedBarangayBordersForCurrentUser(): Promise<UserCityLookupResult> {
  const geoRiskCityName = await resolveCurrentGeoRiskCityName()
  const raw = await fetchBarangayBordersSourceByCity(geoRiskCityName)

  return {
    geoRiskCityName,
    borders: normalizeBarangayFeatureCollection(raw),
  }
}
