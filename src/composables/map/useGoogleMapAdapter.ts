import type { Ref } from 'vue'
import type { BarangayFeatureCollection, GooglePolygonPath } from '@/types/map.types'
import {
  buildMapInfoWindowHtml,
  getBarangayLabel,
  getBorderColor,
  getFeaturePolygons,
  toGooglePath,
} from '@/utils/map/barangayBorder.utils'

interface GoogleAdapterOptions {
  containerRef: Ref<HTMLDivElement | null>
  center: { lat: number; lng: number }
  mapId?: string
  getApiKey: () => string
}

type GoogleMapInstance = {
  setCenter: (latLng: { lat: number; lng: number }) => void
}

type GoogleLatLng = {
  lat: () => number
  lng: () => number
}

type GoogleMapMouseEvent = {
  latLng?: GoogleLatLng
}

type GooglePolygonInstance = {
  setMap: (map: GoogleMapInstance | null) => void
  addListener?: (
    eventName: 'click' | 'mouseover' | 'mouseout',
    handler: (event: GoogleMapMouseEvent) => void,
  ) => void
}

type GoogleInfoWindowInstance = {
  setContent: (content: string) => void
  setPosition: (position: GooglePolygonPath) => void
  open: (options: { map: GoogleMapInstance }) => void
  close: () => void
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
  Polygon?: new (options: {
    paths: GooglePolygonPath[][]
    strokeColor: string
    strokeOpacity: number
    strokeWeight: number
    fillColor: string
    fillOpacity: number
    map: GoogleMapInstance
  }) => GooglePolygonInstance
  InfoWindow?: new () => GoogleInfoWindowInstance
  importLibrary?: (name: string) => Promise<unknown>
  marker?: {
    AdvancedMarkerElement?: AdvancedMarkerLibrary['AdvancedMarkerElement']
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

export function useGoogleMapAdapter(options: GoogleAdapterOptions) {
  let googleMapsLoader: Promise<void> | null = null
  let googleMap: GoogleMapInstance | null = null
  let googleBarangayPolygons: GooglePolygonInstance[] = []
  let googleBarangayInfoWindow: GoogleInfoWindowInstance | null = null

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function destroyGoogleBarangayPolygons(): void {
    googleBarangayPolygons.forEach((polygon) => polygon.setMap(null))
    googleBarangayPolygons = []

    if (googleBarangayInfoWindow) {
      googleBarangayInfoWindow.close()
    }
  }

  function destroy(): void {
    destroyGoogleBarangayPolygons()
    googleMap = null
  }

  function openGoogleBarangayInfoWindow(label: string, latLng?: GoogleLatLng): void {
    if (!googleMap || !googleBarangayInfoWindow) {
      return
    }

    if (latLng) {
      googleBarangayInfoWindow.setPosition({ lat: latLng.lat(), lng: latLng.lng() })
    }

    googleBarangayInfoWindow.setContent(buildMapInfoWindowHtml(label))
    googleBarangayInfoWindow.open({ map: googleMap })
  }

  async function renderBarangayBorders(
    showBarangayBorders: boolean,
    barangayBorders: BarangayFeatureCollection | null,
  ): Promise<void> {
    destroyGoogleBarangayPolygons()

    if (!googleMap || !showBarangayBorders || !barangayBorders) {
      return
    }

    const googleMaps = (window as GoogleWindow).google?.maps
    if (!googleMaps?.Polygon) {
      return
    }

    const PolygonCtor = googleMaps.Polygon

    if (googleMaps.InfoWindow && !googleBarangayInfoWindow) {
      googleBarangayInfoWindow = new googleMaps.InfoWindow()
    }

    barangayBorders.features.forEach((feature, featureIndex) => {
      const borderColor = getBorderColor(featureIndex)
      const label = getBarangayLabel(feature, featureIndex)

      getFeaturePolygons(feature).forEach((polygonRings) => {
        const paths = polygonRings.map((ring) => toGooglePath(ring))

        const polygon = new PolygonCtor({
          paths,
          strokeColor: borderColor,
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: borderColor,
          fillOpacity: 0.1,
          map: googleMap as GoogleMapInstance,
        })

        if (polygon.addListener) {
          polygon.addListener('mouseover', (event) => {
            openGoogleBarangayInfoWindow(label, event.latLng)
          })

          polygon.addListener('click', (event) => {
            openGoogleBarangayInfoWindow(label, event.latLng)
          })

          polygon.addListener('mouseout', () => {
            if (googleBarangayInfoWindow) {
              googleBarangayInfoWindow.close()
            }
          })
        }

        googleBarangayPolygons.push(polygon)
      })
    })
  }

  function loadGoogleMaps(): Promise<void> {
    const googleWindow = window as GoogleWindow
    const resolvedGoogleMapsApiKey = options.getApiKey()

    if (!resolvedGoogleMapsApiKey) {
      return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
    }

    if (googleWindow.google?.maps) {
      return Promise.resolve()
    }

    if (googleMapsLoader) {
      return googleMapsLoader
    }

    googleMapsLoader = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-maps-sdk') as HTMLScriptElement | null

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Google Maps failed to load')),
          { once: true },
        )
        return
      }

      const script = document.createElement('script')
      script.id = 'google-maps-sdk'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${resolvedGoogleMapsApiKey}&loading=async&libraries=marker&v=weekly`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Google Maps failed to load'))
      document.head.appendChild(script)
    })

    return googleMapsLoader
  }

  async function initializeMapInstance(): Promise<boolean> {
    if (!options.containerRef.value) {
      return false
    }

    const googleMaps = (window as GoogleWindow).google?.maps

    if (!googleMaps) {
      return false
    }

    let MapCtor: GoogleMapCtor | undefined
    let AdvancedMarkerElement: AdvancedMarkerLibrary['AdvancedMarkerElement'] | undefined

    if (typeof googleMaps.Map === 'function') {
      MapCtor = googleMaps.Map
    }

    if (!MapCtor && typeof googleMaps.importLibrary === 'function') {
      const mapsLibrary = (await googleMaps.importLibrary('maps')) as unknown as MapsLibrary
      if (typeof mapsLibrary.Map === 'function') {
        MapCtor = mapsLibrary.Map
      }
    }

    if (typeof googleMaps.importLibrary === 'function') {
      const markerLibrary = (await googleMaps.importLibrary('marker')) as unknown as AdvancedMarkerLibrary
      AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
    } else {
      AdvancedMarkerElement = googleMaps.marker?.AdvancedMarkerElement
    }

    if (!MapCtor) {
      return false
    }

    const map = new MapCtor(options.containerRef.value, {
      center: options.center,
      zoom: 12,
      mapId: options.mapId,
    })
    googleMap = map

    if (AdvancedMarkerElement) {
      new AdvancedMarkerElement({
        position: options.center,
        map,
        title: 'Butuan City',
      })
      return true
    }

    if (googleMaps.Marker) {
      new googleMaps.Marker({
        position: options.center,
        map,
        title: 'Butuan City',
      })
      return true
    }

    return true
  }

  async function init(): Promise<void> {
    await loadGoogleMaps()

    let initialized = false

    for (let attempt = 0; attempt < 6 && !initialized; attempt += 1) {
      initialized = await initializeMapInstance()

      if (!initialized) {
        await delay(200)
      }
    }

    if (!initialized) {
      throw new Error(
        'Google Maps could not be initialized. Check API key and Google Cloud restrictions.',
      )
    }
  }

  return {
    init,
    destroy,
    renderBarangayBorders,
  }
}
