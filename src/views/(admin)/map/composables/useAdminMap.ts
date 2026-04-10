import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBarangayBorders } from '@/composables/map/useBarangayBorders.ts'
import {
  createHazard,
  deleteHazard,
  listHazards,
  updateHazard,
} from '@/services/hazard/hazard.service.ts'
import {
  createMappedZone,
  createZoningLayer,
  deleteMappedZone,
  deleteZoningLayer,
  listCityMappedZones,
  listCityZoningLayers,
  setZoningLayerActive,
  updateMappedZone,
  updateZoningLayer,
} from '@/services/zoning/zoning.service.ts'
import { resolveCityCenter } from '@/services/cities.service.ts'
import { getSupabaseClient } from '@/services/supabase.client.ts'
import type {
  CreateHazardFormInput,
  Hazard,
  HazardGeometry,
  HazardGeometryType,
  HazardId,
  UpdateHazardInput,
} from '@/types/hazard.types.ts'
import type { BarangayFeatureCollection } from '@/types/map.types.ts'
import type {
  CreateMappedZoneInput,
  CreateZoningLayerInput,
  MappedZone,
  MapDrawPoint,
  UpdateMappedZoneInput,
  UpdateZoningLayerInput,
  ZoningLayer,
} from '@/types/zoning.types.ts'
import type Map from '@/components/map/Map.vue'

export function useAdminMap() {
  // ── Map state ──────────────────────────────────────────────────────────────
  const provider = ref<'google' | 'leaflet'>('leaflet')
  const mapRef = ref<InstanceType<typeof Map> | null>(null)
  const mapCenter = ref({ lat: 8.9475, lng: 125.5406 })

  // ── Barangay borders ───────────────────────────────────────────────────────
  const { barangayBorders, isLoading, errorMessage, loadBarangayBorders } = useBarangayBorders()
  const showBarangayBorders = ref(false)

  // ── Sidebar UI state ───────────────────────────────────────────────────────
  const isSidebarOpen = ref(false)
  const isHazardSidebarOpen = ref(false)

  // ── Zoning state ───────────────────────────────────────────────────────────
  const isSavingLayer = ref(false)
  const isSavingMappedZone = ref(false)
  const zoningError = ref('')
  const zoningLayers = ref<ZoningLayer[]>([])
  const mappedZones = ref<MappedZone[]>([])

  // ── Draw mode state ────────────────────────────────────────────────────────
  const isDrawMode = ref(false)
  const drawPoints = ref<MapDrawPoint[]>([])
  const showMappedZoneModal = ref(false)
  const selectedMappedZoneId = ref<string | null>(null)

  // ── Hazard state ───────────────────────────────────────────────────────────
  const hazards = ref<Hazard[]>([])
  const isLoadingHazards = ref(false)
  const isSavingHazard = ref(false)
  const hazardError = ref('')
  const selectedHazardId = ref<HazardId | null>(null)
  const hazardsEnabled = ref(false)
  const hasLoadedHazards = ref(false)
  const hazardPlacementType = ref<HazardGeometryType | null>(null)
  const hazardDrawPoints = ref<MapDrawPoint[]>([])
  const showHazardFormModal = ref(false)

  // ── Computed ───────────────────────────────────────────────────────────────
  const isSidebarSubmitting = computed(() => isSavingLayer.value || isSavingMappedZone.value)

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

  const isHazardPlacementActive = computed(() => hazardPlacementType.value !== null)
  const activeDrawPoints = computed(() =>
    isHazardPlacementActive.value ? hazardDrawPoints.value : drawPoints.value,
  )
  const isAnyDrawModeActive = computed(() => isDrawMode.value || isHazardPlacementActive.value)

  // ── Barangay borders ───────────────────────────────────────────────────────
  async function toggleBarangayBorders(): Promise<void> {
    if (!showBarangayBorders.value) {
      await loadBarangayBorders()
    }
    showBarangayBorders.value = !showBarangayBorders.value
  }

  // ── Zoning layers ──────────────────────────────────────────────────────────
  async function loadZoningLayers(): Promise<void> {
    zoningError.value = ''
    try {
      zoningLayers.value = await listCityZoningLayers()
    } catch (error) {
      zoningError.value = error instanceof Error ? error.message : 'Failed to load zoning layers.'
    }
  }

  async function loadMappedZones(): Promise<void> {
    zoningError.value = ''
    try {
      mappedZones.value = await listCityMappedZones()
    } catch (error) {
      zoningError.value = error instanceof Error ? error.message : 'Failed to load mapped zones.'
    }
  }

  async function loadMapCenterFromUserMetadata(): Promise<void> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return
    }

    const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>
    const center = await resolveCityCenter({
      cityId: typeof metadata.city_id === 'string' ? metadata.city_id : null,
      cityName: typeof metadata.city_name === 'string' ? metadata.city_name : null,
      legacyCity: typeof metadata.city === 'string' ? metadata.city : null,
    })

    if (!center) {
      return
    }

    mapCenter.value = { lat: center.lat, lng: center.lng }
    mapRef.value?.setCenter(mapCenter.value, 14)
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
      zoningLayers.value = zoningLayers.value.map((layer) =>
        layer.id !== updatedLayer.id ? layer : updatedLayer,
      )
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
      zoningLayers.value = zoningLayers.value.map((layer) =>
        layer.id !== updatedLayer.id ? layer : updatedLayer,
      )
    } catch (error) {
      zoningError.value =
        error instanceof Error ? error.message : 'Failed to toggle layer visibility.'
    } finally {
      isSavingLayer.value = false
    }
  }

  // ── Mapped zones ───────────────────────────────────────────────────────────
  async function handleSaveMappedZone(
    payload: Omit<CreateMappedZoneInput, 'points'>,
  ): Promise<void> {
    isSavingMappedZone.value = true
    zoningError.value = ''
    try {
      await createMappedZone({ ...payload, points: drawPoints.value })
      await loadMappedZones()
      cancelDrawZoneMode()
    } catch (error) {
      zoningError.value = error instanceof Error ? error.message : 'Failed to save mapped zone.'
    } finally {
      isSavingMappedZone.value = false
    }
  }

  async function handleUpdateMappedZone(payload: {
    zoneId: string
    input: UpdateMappedZoneInput
  }): Promise<void> {
    isSavingMappedZone.value = true
    zoningError.value = ''
    try {
      await updateMappedZone(payload.zoneId, payload.input)
      await loadMappedZones()
    } catch (error) {
      zoningError.value = error instanceof Error ? error.message : 'Failed to update mapped zone.'
    } finally {
      isSavingMappedZone.value = false
    }
  }

  async function handleDeleteMappedZone(zoneId: string): Promise<void> {
    isSavingMappedZone.value = true
    zoningError.value = ''
    try {
      await deleteMappedZone(zoneId)
      await loadMappedZones()
    } catch (error) {
      zoningError.value = error instanceof Error ? error.message : 'Failed to delete mapped zone.'
    } finally {
      isSavingMappedZone.value = false
    }
  }

  function handleFocusMappedZone(zoneId: string): void {
    selectedMappedZoneId.value = zoneId
  }

  // ── Draw zone mode ─────────────────────────────────────────────────────────
  function startDrawZoneMode(): void {
    if (isHazardPlacementActive.value) {
      cancelHazardPlacement()
    }
    if (zoningLayers.value.length === 0) {
      zoningError.value = 'Please add at least one zoning layer before drawing a zone.'
      return
    }
    zoningError.value = ''
    drawPoints.value = []
    isDrawMode.value = true
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

  // ── Hazard placement ───────────────────────────────────────────────────────
  async function loadHazards(force = false): Promise<void> {
    if (hasLoadedHazards.value && !force) {
      return
    }
    isLoadingHazards.value = true
    hazardError.value = ''
    try {
      const response = await listHazards({
        page: 1,
        pageSize: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      hazards.value = response.data
      hasLoadedHazards.value = true
    } catch (error) {
      hazardError.value = error instanceof Error ? error.message : 'Failed to load hazards.'
    } finally {
      isLoadingHazards.value = false
    }
  }

  async function ensureHazardsLoaded(): Promise<void> {
    await loadHazards(false)
  }

  function startHazardPlacement(placementType: HazardGeometryType): void {
    if (isDrawMode.value) {
      cancelDrawZoneMode()
    }
    hazardError.value = ''
    hazardPlacementType.value = placementType
    hazardDrawPoints.value = []
    showHazardFormModal.value = false
  }

  function cancelHazardPlacement(): void {
    hazardPlacementType.value = null
    hazardDrawPoints.value = []
    showHazardFormModal.value = false
  }

  function appendHazardPoint(point: MapDrawPoint): void {
    if (!hazardPlacementType.value) return
    if (hazardPlacementType.value === 'point') {
      hazardDrawPoints.value = [point]
      showHazardFormModal.value = true
      return
    }
    hazardDrawPoints.value = [...hazardDrawPoints.value, point]
  }

  function moveHazardPoint(index: number, point: MapDrawPoint): void {
    if (!hazardPlacementType.value || hazardPlacementType.value === 'point') return
    hazardDrawPoints.value = hazardDrawPoints.value.map((existing, i) =>
      i !== index ? existing : point,
    )
  }

  function undoLastHazardPoint(): void {
    if (!hazardPlacementType.value || hazardDrawPoints.value.length === 0) return
    if (hazardPlacementType.value === 'point') {
      hazardDrawPoints.value = []
      return
    }
    hazardDrawPoints.value = hazardDrawPoints.value.slice(0, -1)
  }

  function finishHazardPlacement(): void {
    if (!hazardPlacementType.value) return
    if (hazardPlacementType.value === 'linestring' && hazardDrawPoints.value.length < 2) {
      hazardError.value = 'Draw at least 2 points to create a hazard line.'
      return
    }
    if (hazardPlacementType.value === 'polygon' && hazardDrawPoints.value.length < 3) {
      hazardError.value = 'Draw at least 3 points to create a hazard polygon.'
      return
    }
    showHazardFormModal.value = true
  }

  function buildHazardGeometry(): HazardGeometry | null {
    if (!hazardPlacementType.value || hazardDrawPoints.value.length === 0) return null

    const toCoordinates = (point: MapDrawPoint): [number, number] => [point.lng, point.lat]
    const firstDrawPoint = hazardDrawPoints.value[0]
    if (!firstDrawPoint) return null

    if (hazardPlacementType.value === 'point') {
      return { type: 'Point', coordinates: toCoordinates(firstDrawPoint) }
    }

    if (hazardPlacementType.value === 'linestring') {
      return { type: 'LineString', coordinates: hazardDrawPoints.value.map(toCoordinates) }
    }

    const ring = hazardDrawPoints.value.map(toCoordinates)
    const [firstPoint] = ring
    const lastPoint = ring[ring.length - 1]
    if (firstPoint && lastPoint && (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])) {
      ring.push(firstPoint)
    }
    return { type: 'Polygon', coordinates: [ring] }
  }

  async function handleSaveHazard(payload: CreateHazardFormInput): Promise<void> {
    if (!hazardPlacementType.value) {
      hazardError.value = 'Choose a hazard placement type first.'
      return
    }
    const geometry = buildHazardGeometry()
    if (!geometry) {
      hazardError.value = 'Capture a valid geometry on the map first.'
      return
    }
    isSavingHazard.value = true
    hazardError.value = ''
    try {
      const createdHazard = await createHazard({
        ...payload,
        geometry,
        geometry_type: hazardPlacementType.value,
      })
      hazards.value = [createdHazard, ...hazards.value]
      hasLoadedHazards.value = true
      hazardsEnabled.value = true
      selectedHazardId.value = createdHazard.id
      cancelHazardPlacement()
    } catch (error) {
      hazardError.value = error instanceof Error ? error.message : 'Failed to create hazard.'
    } finally {
      isSavingHazard.value = false
    }
  }

  async function handleToggleHazardsEnabled(enabled: boolean): Promise<void> {
    hazardsEnabled.value = enabled
    if (enabled) {
      await ensureHazardsLoaded()
    }
  }

  function handleStartCreateHazard(placementType: HazardGeometryType): void {
    startHazardPlacement(placementType)
  }

  function handleSelectHazard(hazardId: HazardId): void {
    selectedHazardId.value = hazardId
  }

  async function handleUpdateHazard(payload: {
    hazardId: HazardId
    input: UpdateHazardInput
  }): Promise<void> {
    isSavingHazard.value = true
    hazardError.value = ''
    try {
      const updatedHazard = await updateHazard(payload.hazardId, payload.input)
      hazards.value = hazards.value.map((hazard) =>
        hazard.id !== updatedHazard.id ? hazard : updatedHazard,
      )
    } catch (error) {
      hazardError.value = error instanceof Error ? error.message : 'Failed to update hazard.'
    } finally {
      isSavingHazard.value = false
    }
  }

  async function handleDeleteHazard(hazardId: HazardId): Promise<void> {
    isSavingHazard.value = true
    hazardError.value = ''
    try {
      await deleteHazard(hazardId)
      hazards.value = hazards.value.filter((hazard) => hazard.id !== hazardId)
      if (selectedHazardId.value === hazardId) {
        selectedHazardId.value = null
      }
    } catch (error) {
      hazardError.value = error instanceof Error ? error.message : 'Failed to delete hazard.'
    } finally {
      isSavingHazard.value = false
    }
  }

  // ── Map event handlers ─────────────────────────────────────────────────────
  function handleMapClick(point: MapDrawPoint): void {
    if (isHazardPlacementActive.value) {
      appendHazardPoint(point)
      if (hazardPlacementType.value === 'point') {
        showHazardFormModal.value = true
      }
      return
    }
    if (!isDrawMode.value) return
    drawPoints.value = [...drawPoints.value, point]
  }

  function handleDrawPointMove(index: number, point: MapDrawPoint): void {
    if (isHazardPlacementActive.value) {
      moveHazardPoint(index, point)
      return
    }
    if (!isDrawMode.value) return
    drawPoints.value = drawPoints.value.map((existing, i) => (i !== index ? existing : point))
  }

  function undoLastDrawPoint(): void {
    if (isHazardPlacementActive.value) {
      undoLastHazardPoint()
      return
    }
    if (!isDrawMode.value || drawPoints.value.length === 0) return
    drawPoints.value = drawPoints.value.slice(0, -1)
  }

  function handleDrawUndoShortcut(event: KeyboardEvent): void {
    const activePoints = isHazardPlacementActive.value ? hazardDrawPoints.value : drawPoints.value
    if (!isAnyDrawModeActive.value || activePoints.length === 0) return
    if (event.defaultPrevented || event.shiftKey || event.altKey) return

    const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z'
    if (!isUndoShortcut) return

    const target = event.target as HTMLElement | null
    const isTypingTarget =
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    if (isTypingTarget) return

    event.preventDefault()
    undoLastDrawPoint()
  }

  // ── Map ref helpers ────────────────────────────────────────────────────────
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

  async function onMapReady(): Promise<void> {
    mapRef.value?.setCenter(mapCenter.value, 14)
    mapRef.value?.setDrawMode(isAnyDrawModeActive.value)
    mapRef.value?.setMapClickHandler(isAnyDrawModeActive.value ? handleMapClick : null)
    mapRef.value?.setDrawPointMoveHandler(isAnyDrawModeActive.value ? handleDrawPointMove : null)
    await Promise.all([
      mapRef.value?.renderBarangayBorders(
        showBarangayBorders.value,
        (barangayBorders.value as BarangayFeatureCollection) ?? null,
      ),
      mapRef.value?.renderMappedZones(visibleMappedZones.value),
      mapRef.value?.renderHazards(hazardsEnabled.value, hazards.value),
      mapRef.value?.renderDrawPreview(activeDrawPoints.value),
    ])
  }

  // ── Panel toggle helpers (mutually exclusive) ──────────────────────────────
  function toggleLayerSidebar(): void {
    isSidebarOpen.value = !isSidebarOpen.value
    if (isSidebarOpen.value) {
      isHazardSidebarOpen.value = false
    }
  }

  function toggleHazardSidebar(): void {
    isHazardSidebarOpen.value = !isHazardSidebarOpen.value
    if (isHazardSidebarOpen.value) {
      isSidebarOpen.value = false
    }
  }

  // ── Watchers ───────────────────────────────────────────────────────────────
  watch(
    [showBarangayBorders, barangayBorders],
    () => {
      void mapRef.value?.renderBarangayBorders(
        showBarangayBorders.value,
        (barangayBorders.value as BarangayFeatureCollection) ?? null,
      )
    },
    { deep: true },
  )

  watch(visibleMappedZones, (zones) => {
    void mapRef.value?.renderMappedZones(zones)
  }, { deep: true })

  watch(
    [hazardsEnabled, hazards],
    () => {
      void mapRef.value?.renderHazards(hazardsEnabled.value, hazards.value)
    },
    { deep: true },
  )

  watch(activeDrawPoints, (points) => {
    void mapRef.value?.renderDrawPreview(points)
  }, { deep: true })

  watch(
    [selectedMappedZoneId, visibleMappedZones],
    () => {
      if (!selectedMappedZoneId.value) return
      const zone = visibleMappedZones.value.find((z) => z.id === selectedMappedZoneId.value)
      if (zone?.points.length) {
        void mapRef.value?.focusOnZone(zone.points)
      }
    },
    { deep: true },
  )

  watch(
    [selectedHazardId, hazards, hazardsEnabled],
    () => {
      if (!hazardsEnabled.value || !selectedHazardId.value) return
      const hazard = hazards.value.find((h) => h.id === selectedHazardId.value)
      if (hazard) {
        const points = getHazardFocusPoints(hazard)
        if (points.length) {
          void mapRef.value?.focusOnZone(points)
        }
      }
    },
    { deep: true },
  )

  watch(isAnyDrawModeActive, async (enabled) => {
    mapRef.value?.setDrawMode(enabled)
    mapRef.value?.setMapClickHandler(enabled ? handleMapClick : null)
    mapRef.value?.setDrawPointMoveHandler(enabled ? handleDrawPointMove : null)
    await mapRef.value?.renderDrawPreview(activeDrawPoints.value)
  })

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onMounted(async () => {
    window.addEventListener('keydown', handleDrawUndoShortcut)
    await Promise.all([loadMapCenterFromUserMetadata(), loadZoningLayers(), loadMappedZones()])
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleDrawUndoShortcut)
  })

  return {
    // Map
    provider,
    mapRef,
    mapCenter,
    onMapReady,
    // Barangay borders
    barangayBorders,
    isLoading,
    errorMessage,
    showBarangayBorders,
    toggleBarangayBorders,
    // Sidebar UI
    isSidebarOpen,
    isHazardSidebarOpen,
    toggleLayerSidebar,
    toggleHazardSidebar,
    // Zoning
    isSavingLayer,
    isSavingMappedZone,
    isSidebarSubmitting,
    zoningError,
    zoningLayers,
    mappedZones,
    visibleMappedZones,
    handleCreateLayer,
    handleUpdateLayer,
    handleDeleteLayer,
    handleToggleLayerVisibility,
    // Draw zone
    isDrawMode,
    drawPoints,
    showMappedZoneModal,
    selectedMappedZoneId,
    isAnyDrawModeActive,
    activeDrawPoints,
    startDrawZoneMode,
    cancelDrawZoneMode,
    finishDrawZoneMode,
    handleSaveMappedZone,
    handleUpdateMappedZone,
    handleDeleteMappedZone,
    handleFocusMappedZone,
    // Hazards
    hazards,
    isLoadingHazards,
    isSavingHazard,
    hazardError,
    selectedHazardId,
    hazardsEnabled,
    hazardPlacementType,
    hazardDrawPoints,
    showHazardFormModal,
    isHazardPlacementActive,
    loadHazards,
    handleSaveHazard,
    handleToggleHazardsEnabled,
    handleStartCreateHazard,
    handleSelectHazard,
    handleUpdateHazard,
    handleDeleteHazard,
    cancelHazardPlacement,
    undoLastDrawPoint,
    undoLastHazardPoint,
    finishHazardPlacement,
  }
}
