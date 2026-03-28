
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Layers } from 'lucide-vue-next'
import Map from '@/components/map/Map.vue'
import { useBarangayBorders } from '@/composables/map/useBarangayBorders'
import AdminMapRightSidebar from '@/views/admin/admin_map/components/AdminMapRightSidebar.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createZoningLayer, listMyZoningLayers } from '@/services/zoning/zoning.service'
import type { CreateZoningLayerInput, ZoningLayer } from '@/types/zoning.types'

const provider = ref<'google' | 'leaflet'>('leaflet')
const showBarangayBorders = ref(false)
const isSidebarOpen = ref(false)
const isSavingLayer = ref(false)
const zoningLayers = ref<ZoningLayer[]>([])
const zoningError = ref('')

const { barangayBorders, isLoading, errorMessage, loadBarangayBorders } = useBarangayBorders()

onMounted(async () => {
  await loadZoningLayers()
})

async function toggleBarangayBorders() {
  if (!showBarangayBorders.value) {
    await loadBarangayBorders()
  }

  showBarangayBorders.value = !showBarangayBorders.value
}

async function loadZoningLayers(): Promise<void> {
  zoningError.value = ''
  try {
    zoningLayers.value = await listMyZoningLayers()
  } catch (error) {
    zoningError.value = error instanceof Error ? error.message : 'Failed to load zoning layers.'
  }
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
</script>

<template>
  <div class="w-full h-full flex flex-col gap-3 p-3">
    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm font-medium">Map Provider</label>
      <Select v-model="provider">
        <SelectTrigger class="w-60">
          <SelectValue placeholder="Select map provider" />
        </SelectTrigger>
        <SelectContent style="z-index: 9999">
          <SelectItem value="leaflet">Leaflet OpenStreetMap</SelectItem>
          <SelectItem value="google">Google Maps</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" :disabled="isLoading" @click="toggleBarangayBorders">
        {{ showBarangayBorders ? 'Hide Barangay Border' : 'Show Barangay Border' }}
      </Button>

      <span v-if="isLoading" class="text-xs text-muted-foreground">Loading barangay borders...</span>
      <span v-if="errorMessage" class="text-xs text-destructive">{{ errorMessage }}</span>
    </div>

    <div class="relative flex-1 min-h-0">
      <Map
        :provider="provider"
        :show-barangay-borders="showBarangayBorders"
        :barangay-borders="barangayBorders"
      />

      <Button
        variant="secondary"
        class="absolute right-3 top-3 z-9998"
        @click="isSidebarOpen = true"
      >
        <Layers class="h-4 w-4" />
        Layers
      </Button>

      <AdminMapRightSidebar
        :is-open="isSidebarOpen"
        :layers="zoningLayers"
        :is-submitting="isSavingLayer"
        @close="isSidebarOpen = false"
        @submit-layer="handleCreateLayer"
      />

      <div
        v-if="zoningError"
        class="absolute bottom-3 left-3 z-9999 rounded-md border border-destructive/45 bg-destructive/12 px-3 py-2 text-xs text-destructive shadow"
      >
        {{ zoningError }}
      </div>
    </div>
  </div>
</template>
