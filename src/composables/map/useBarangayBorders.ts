import { ref } from 'vue'
import {
  fetchNormalizedBarangayBordersForCurrentUser,
} from '@/services/barangay-borders.service'
import type { BarangayFeatureCollection } from '@/types/map.types'

export function useBarangayBorders() {
  const barangayBorders = ref<BarangayFeatureCollection | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const activeGeoRiskCityName = ref<string | null>(null)
  const cityBordersCache = new Map<string, BarangayFeatureCollection>()

  async function loadBarangayBorders(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const {
        geoRiskCityName,
        borders,
      } = await fetchNormalizedBarangayBordersForCurrentUser()

      if (
        activeGeoRiskCityName.value === geoRiskCityName
        && barangayBorders.value
      ) {
        return
      }

      const cachedBorders = cityBordersCache.get(geoRiskCityName)
      if (cachedBorders) {
        barangayBorders.value = cachedBorders
        activeGeoRiskCityName.value = geoRiskCityName
        return
      }

      cityBordersCache.set(geoRiskCityName, borders)
      barangayBorders.value = borders
      activeGeoRiskCityName.value = geoRiskCityName
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Unable to load barangay border map data.'
      barangayBorders.value = null
      activeGeoRiskCityName.value = null
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
