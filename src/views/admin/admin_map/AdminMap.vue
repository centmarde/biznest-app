
<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/components/map/Map.vue'
import { useBarangayBorders } from '@/composables/map/useBarangayBorders'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const provider = ref<'google' | 'leaflet'>('leaflet')
const showBarangayBorders = ref(false)

const { barangayBorders, isLoading, errorMessage, loadBarangayBorders } = useBarangayBorders()

async function toggleBarangayBorders() {
  if (!showBarangayBorders.value) {
    await loadBarangayBorders()
  }

  showBarangayBorders.value = !showBarangayBorders.value
}
</script>

<template>
  <div class="w-full h-full flex flex-col gap-3 p-3">
    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm font-medium">Map Provider</label>
      <Select v-model="provider">
        <SelectTrigger class="w-[240px]">
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

    <div class="flex-1 min-h-0">
      <Map
        :provider="provider"
        :show-barangay-borders="showBarangayBorders"
        :barangay-borders="barangayBorders"
      />
    </div>
  </div>
</template>
