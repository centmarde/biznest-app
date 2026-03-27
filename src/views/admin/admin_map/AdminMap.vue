
<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/components/map/Map.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const provider = ref<'google' | 'leaflet'>('leaflet')
</script>

<template>
  <div class="w-full h-full flex flex-col gap-3 p-3">
    <div class="flex items-center gap-2">
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
    </div>

    <div class="flex-1 min-h-0">
      <Map :provider="provider" />
    </div>
  </div>
</template>
