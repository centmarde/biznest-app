import type { Ref } from 'vue'
import type { LayerGroup as LeafletLayerGroup, Map as LeafletMap } from 'leaflet'
import type { BarangayFeatureCollection } from '@/types/map.types'
import {
  getBarangayLabel,
  getBorderColor,
  getFeaturePolygons,
  toLeafletLatLngRings,
} from '@/utils/map/barangayBorder.utils'

interface LeafletAdapterOptions {
  containerRef: Ref<HTMLDivElement | null>
  center: { lat: number; lng: number }
}

export function useLeafletMapAdapter(options: LeafletAdapterOptions) {
  let leafletMap: LeafletMap | null = null
  let leafletBarangayLayer: LeafletLayerGroup | null = null

  async function init(): Promise<void> {
    if (!options.containerRef.value) {
      return
    }

    const L = await import('leaflet')

    leafletMap = L.map(options.containerRef.value).setView(
      [options.center.lat, options.center.lng],
      14,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMap)

    L.marker([options.center.lat, options.center.lng]).addTo(leafletMap).bindPopup('Butuan City')
  }

  function destroyLeafletBarangayLayer(): void {
    if (leafletBarangayLayer) {
      leafletBarangayLayer.remove()
      leafletBarangayLayer = null
    }
  }

  function destroy(): void {
    destroyLeafletBarangayLayer()

    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }
  }

  async function renderBarangayBorders(
    showBarangayBorders: boolean,
    barangayBorders: BarangayFeatureCollection | null,
  ): Promise<void> {
    if (!leafletMap) {
      return
    }

    destroyLeafletBarangayLayer()

    if (!showBarangayBorders || !barangayBorders) {
      return
    }

    const L = await import('leaflet')
    const layerGroup = L.layerGroup()

    barangayBorders.features.forEach((feature, featureIndex) => {
      const borderColor = getBorderColor(featureIndex)
      const label = getBarangayLabel(feature, featureIndex)

      getFeaturePolygons(feature).forEach((polygonRings) => {
        const latLngRings = toLeafletLatLngRings(polygonRings)

        L.polygon(latLngRings, {
          color: borderColor,
          weight: 2,
          opacity: 0.95,
          fillColor: borderColor,
          fillOpacity: 0.1,
        })
          .bindTooltip(label, {
            className: 'map-info-tooltip',
            sticky: true,
          })
          .addTo(layerGroup)
      })
    })

    layerGroup.addTo(leafletMap)
    leafletBarangayLayer = layerGroup
  }

  return {
    init,
    destroy,
    renderBarangayBorders,
  }
}
