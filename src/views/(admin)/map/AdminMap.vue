<script setup lang="ts">
import { useAdminMap } from '@/views/(admin)/map/composables/useAdminMap.ts'
import Map from '@/components/map/Map.vue'
import HazardFormModal from '@/views/(admin)/map/components/HazardFormModal.vue'
import AdminMapRightSidebar from '@/views/(admin)/map/components/AdminMapRightSidebar.vue'
import AdminMapHazardSidebar from '@/views/(admin)/map/components/AdminMapHazardSidebar.vue'
import MappedZoneFormModal from '@/views/(admin)/map/components/MappedZoneFormModal.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TypographyMuted, TypographySmall } from '@/components/typography'
import { Globe, Layers, TriangleAlert } from 'lucide-vue-next'

const {
  // Map
  provider,
  mapRef,
  onMapReady,
  // Barangay borders
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
  isSavingMappedZone,
  isSidebarSubmitting,
  zoningError,
  zoningLayers,
  mappedZones,
  handleCreateLayer,
  handleUpdateLayer,
  handleDeleteLayer,
  handleToggleLayerVisibility,
  // Draw zone
  isDrawMode,
  drawPoints,
  showMappedZoneModal,
  startDrawZoneMode,
  cancelDrawZoneMode,
  finishDrawZoneMode,
  undoLastDrawPoint,
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
  undoLastHazardPoint,
  finishHazardPlacement,
} = useAdminMap()
</script>

<template>
  <!--
    Map fills the entire main content area.
    Layout (left → right): [map canvas] [hazard panel?] [layer panel?] [icon strip]
  -->
  <div class="flex h-full w-full overflow-hidden">

    <!-- ── Map canvas ────────────────────────────────────────────────── -->
    <div class="relative min-w-0 flex-1">
      <Map ref="mapRef" :provider="provider" @ready="onMapReady" />

      <!-- Floating map-provider selector (top-left over the map) -->
      <div class="absolute left-3 top-3 z-900 flex items-center gap-2">
        <Select v-model="provider">
          <SelectTrigger class="h-8 w-48 bg-card/90 text-xs shadow backdrop-blur-sm">
            <SelectValue placeholder="Map provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leaflet">Leaflet (OpenStreetMap)</SelectItem>
            <SelectItem value="google">Google Maps</SelectItem>
          </SelectContent>
        </Select>
        <span
          v-if="isLoading"
          class="rounded-md bg-card/90 px-2 py-1 text-xs text-muted-foreground shadow backdrop-blur-sm"
        >
          Loading borders…
        </span>
        <span
          v-else-if="errorMessage"
          class="rounded-md bg-card/90 px-2 py-1 text-xs text-destructive shadow backdrop-blur-sm"
        >
          {{ errorMessage }}
        </span>
      </div>

      <!-- Hazard placement HUD (below provider selector) -->
      <div
        v-if="isHazardPlacementActive"
        class="absolute left-3 top-14 z-900 rounded-md border bg-card/95 px-3 py-2 shadow"
      >
        <TypographySmall as="p" class="text-xs font-medium">Hazard Placement Active</TypographySmall>
        <TypographyMuted as="p" class="text-xs">
          {{
            hazardPlacementType === 'point'
              ? 'Click the map once to place a pin.'
              : `Captured ${hazardDrawPoints.length} points`
          }}
        </TypographyMuted>
        <div class="mt-2 flex gap-2">
          <Button
            v-if="hazardPlacementType !== 'point'"
            size="sm"
            variant="outline"
            :disabled="hazardDrawPoints.length === 0"
            @click="undoLastHazardPoint"
          >
            <TypographySmall as="span">Undo</TypographySmall>
          </Button>
          <Button size="sm" variant="outline" @click="cancelHazardPlacement">
            <TypographySmall as="span">Cancel</TypographySmall>
          </Button>
          <Button
            v-if="hazardPlacementType !== 'point'"
            size="sm"
            :disabled="
              hazardPlacementType === 'linestring'
                ? hazardDrawPoints.length < 2
                : hazardDrawPoints.length < 3
            "
            @click="finishHazardPlacement"
          >
            <TypographySmall as="span">
              {{ hazardPlacementType === 'linestring' ? 'Finish Line' : 'Finish Polygon' }}
            </TypographySmall>
          </Button>
        </div>
      </div>

      <!-- Draw zone HUD (below provider selector) -->
      <div
        v-else-if="isDrawMode"
        class="absolute left-3 top-14 z-900 rounded-md border bg-card/95 px-3 py-2 shadow"
      >
        <TypographySmall as="p" class="text-xs font-medium">Draw Mode Active</TypographySmall>
        <TypographyMuted as="p" class="text-xs">{{ drawPoints.length }} points</TypographyMuted>
        <div class="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="drawPoints.length === 0"
            @click="undoLastDrawPoint"
          >
            <TypographySmall as="span">Undo</TypographySmall>
          </Button>
          <Button size="sm" variant="outline" @click="cancelDrawZoneMode">
            <TypographySmall as="span">Cancel</TypographySmall>
          </Button>
          <Button size="sm" :disabled="drawPoints.length < 3" @click="finishDrawZoneMode">
            <TypographySmall as="span">Save Polygon</TypographySmall>
          </Button>
        </div>
      </div>

      <!-- Zoning error toast (bottom-left) -->
      <div
        v-if="zoningError"
        class="absolute bottom-3 left-3 z-900 rounded-md border border-destructive/45 bg-destructive/12 px-3 py-2 text-destructive shadow"
      >
        <TypographySmall as="p" class="m-0 text-xs">{{ zoningError }}</TypographySmall>
      </div>

      <!-- Portaled modals (Sheet — renders in <body>) -->
      <HazardFormModal
        :open="showHazardFormModal"
        mode="add"
        :is-submitting="isSavingHazard"
        :placement-type="hazardPlacementType"
        :point-count="hazardDrawPoints.length"
        @close="cancelHazardPlacement"
        @submit-create="handleSaveHazard"
      />
      <MappedZoneFormModal
        :open="showMappedZoneModal"
        :layers="zoningLayers"
        :is-submitting="isSavingMappedZone"
        :point-count="drawPoints.length"
        @close="showMappedZoneModal = false"
        @submit="handleSaveMappedZone"
      />
    </div>

    <!-- ── Hazard panel (inline, left of icon strip) ──────────────── -->
    <AdminMapHazardSidebar
      v-if="isHazardSidebarOpen"
      :hazards="hazards"
      :is-enabled="hazardsEnabled"
      :is-loading="isLoadingHazards"
      :is-submitting="isSavingHazard"
      :error-message="hazardError"
      :selected-hazard-id="selectedHazardId"
      @close="isHazardSidebarOpen = false"
      @refresh="loadHazards(true)"
      @toggle-enabled="handleToggleHazardsEnabled"
      @select-hazard="handleSelectHazard"
      @start-create-hazard="handleStartCreateHazard"
      @update-hazard="handleUpdateHazard"
      @delete-hazard="handleDeleteHazard"
    />

    <!-- ── Layer panel (inline, left of icon strip) ───────────────── -->
    <AdminMapRightSidebar
      v-if="isSidebarOpen"
      :layers="zoningLayers"
      :mapped-zones="mappedZones"
      :is-submitting="isSidebarSubmitting"
      @close="isSidebarOpen = false"
      @start-draw-zone="startDrawZoneMode"
      @submit-layer="handleCreateLayer"
      @update-layer="handleUpdateLayer"
      @delete-layer="handleDeleteLayer"
      @update-mapped-zone="handleUpdateMappedZone"
      @delete-mapped-zone="handleDeleteMappedZone"
      @focus-mapped-zone="handleFocusMappedZone"
      @toggle-layer-visibility="handleToggleLayerVisibility"
    />

    <!-- ── Vertical icon strip (always visible) ───────────────────── -->
    <div class="flex w-11 shrink-0 flex-col border-l bg-card">
      <TooltipProvider :delay-duration="300">

        <!-- Layers -->
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="flex h-11 w-full items-center justify-center transition-colors hover:bg-muted"
              :class="isSidebarOpen ? 'bg-muted text-foreground' : 'text-muted-foreground'"
              @click="toggleLayerSidebar"
            >
              <Layers class="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Layers</TooltipContent>
        </Tooltip>

        <div class="h-px bg-border" />

        <!-- Hazards -->
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="flex h-11 w-full items-center justify-center transition-colors hover:bg-muted"
              :class="isHazardSidebarOpen ? 'bg-muted text-amber-500' : 'text-muted-foreground'"
              @click="toggleHazardSidebar"
            >
              <TriangleAlert class="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Hazards</TooltipContent>
        </Tooltip>

        <div class="h-px bg-border" />

        <!-- Barangay borders -->
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="flex h-11 w-full items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              :class="showBarangayBorders ? 'bg-muted text-foreground' : 'text-muted-foreground'"
              :disabled="isLoading"
              @click="toggleBarangayBorders"
            >
              <Globe class="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {{ showBarangayBorders ? 'Hide Barangay Borders' : 'Show Barangay Borders' }}
          </TooltipContent>
        </Tooltip>


      </TooltipProvider>
    </div>
  </div>
</template>
