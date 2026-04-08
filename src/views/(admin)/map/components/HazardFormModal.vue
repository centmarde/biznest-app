    <script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreateHazardInput,
  Hazard,
  HazardGeometry,
  HazardGeometryType,
  HazardSeverity,
  HazardStatus,
  UpdateHazardInput,
} from '@/types/hazard.types'

const severityOptions: HazardSeverity[] = ['low', 'medium', 'high', 'critical']
const statusOptions: HazardStatus[] = ['reported', 'verified', 'resolved', 'dismissed']
const geometryOptions: HazardGeometryType[] = ['Point', 'LineString', 'Polygon']

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'add' | 'edit'
    isSubmitting?: boolean
    initialValue?: Hazard | null
  }>(),
  {
    isSubmitting: false,
    initialValue: null,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-create', payload: CreateHazardInput): void
  (e: 'submit-update', payload: UpdateHazardInput): void
}>()

const form = reactive({
  name: '',
  category: '',
  severity: 'low' as HazardSeverity,
  status: 'reported' as HazardStatus,
  location_name: '',
  description: '',
  geometry_type: 'Point' as HazardGeometryType,
  coordinatesText: '[125.5406, 8.9475]',
})

const parseError = reactive({
  message: '',
})

const modalTitle = computed(() => (props.mode === 'add' ? 'Add Hazard' : 'Update Hazard'))
const submitLabel = computed(() => (props.mode === 'add' ? 'Create Hazard' : 'Update Hazard'))

const canSubmit = computed(() => {
  return form.name.trim().length > 0 && form.category.trim().length > 0 && !props.isSubmitting
})

watch(
  () => [props.open, props.mode, props.initialValue],
  () => {
    if (!props.open) {
      return
    }

    parseError.message = ''

    if (props.mode === 'edit' && props.initialValue) {
      form.name = props.initialValue.name
      form.category = props.initialValue.category
      form.severity = props.initialValue.severity
      form.status = props.initialValue.status
      form.location_name = props.initialValue.location_name ?? ''
      form.description = props.initialValue.description ?? ''
      form.geometry_type = props.initialValue.geometry_type
      form.coordinatesText = JSON.stringify(props.initialValue.geometry.coordinates)
      return
    }

    form.name = ''
    form.category = ''
    form.severity = 'low'
    form.status = 'reported'
    form.location_name = ''
    form.description = ''
    form.geometry_type = 'Point'
    form.coordinatesText = '[125.5406, 8.9475]'
  },
  { deep: true, immediate: true },
)

function buildGeometry(): HazardGeometry | null {
  parseError.message = ''

  try {
    const raw = JSON.parse(form.coordinatesText)

    if (form.geometry_type === 'Point') {
      if (!Array.isArray(raw) || raw.length !== 2) {
        parseError.message = 'Point coordinates must be [lng, lat].'
        return null
      }

      return {
        type: 'Point',
        coordinates: [Number(raw[0]), Number(raw[1])],
      }
    }

    if (form.geometry_type === 'LineString') {
      if (!Array.isArray(raw) || raw.length < 2) {
        parseError.message = 'LineString coordinates must be [[lng, lat], ...].'
        return null
      }

      return {
        type: 'LineString',
        coordinates: raw.map((point) => [Number(point[0]), Number(point[1])]),
      }
    }

    if (!Array.isArray(raw) || raw.length === 0) {
      parseError.message = 'Polygon coordinates must be [[[lng, lat], ...]].'
      return null
    }

    return {
      type: 'Polygon',
      coordinates: raw.map((ring) => ring.map((point: [number, number]) => [Number(point[0]), Number(point[1])])),
    }
  } catch {
    parseError.message = 'Coordinates must be valid JSON.'
    return null
  }
}

function submit(): void {
  if (!canSubmit.value) {
    return
  }

  const geometry = buildGeometry()
  if (!geometry) {
    return
  }

  const basePayload = {
    name: form.name.trim(),
    category: form.category.trim(),
    severity: form.severity,
    status: form.status,
    location_name: form.location_name.trim() || null,
    description: form.description.trim() || null,
    geometry,
    geometry_type: form.geometry_type,
  }

  if (props.mode === 'add') {
    emit('submit-create', basePayload)
    return
  }

  emit('submit-update', basePayload)
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4"
  >
    <Card class="w-full max-w-lg py-0">
      <CardHeader class="border-b py-4">
        <CardTitle class="text-base">{{ modalTitle }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 p-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2 space-y-1">
            <label class="text-xs font-medium">Hazard Name</label>
            <Input v-model="form.name" placeholder="e.g. River Flooding" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Category</label>
            <Input v-model="form.category" placeholder="e.g. flood" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Location Name</label>
            <Input v-model="form.location_name" placeholder="Barangay Doongan" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Severity</label>
            <Select v-model="form.severity">
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent class="z-10002">
                <SelectItem v-for="severity in severityOptions" :key="severity" :value="severity">
                  {{ severity }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Status</label>
            <Select v-model="form.status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent class="z-10002">
                <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium">Geometry Type</label>
            <Select v-model="form.geometry_type">
              <SelectTrigger>
                <SelectValue placeholder="Select geometry" />
              </SelectTrigger>
              <SelectContent class="z-10002">
                <SelectItem v-for="geometry in geometryOptions" :key="geometry" :value="geometry">
                  {{ geometry }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="col-span-2 space-y-1">
            <label class="text-xs font-medium">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              placeholder="Describe hazard details"
            />
          </div>

          <div class="col-span-2 space-y-1">
            <label class="text-xs font-medium">Coordinates (JSON)</label>
            <textarea
              v-model="form.coordinatesText"
              rows="4"
              class="border-input focus-visible:border-ring focus-visible:ring-ring/50 font-mono w-full rounded-md border bg-transparent px-3 py-2 text-xs outline-none focus-visible:ring-[3px]"
              :placeholder="
                form.geometry_type === 'Point'
                  ? '[125.5406, 8.9475]'
                  : form.geometry_type === 'LineString'
                    ? '[[125.54, 8.94], [125.55, 8.95]]'
                    : '[[[125.54, 8.94], [125.55, 8.94], [125.55, 8.95], [125.54, 8.94]]]'
              "
            />
            <p v-if="parseError.message" class="text-xs text-destructive">{{ parseError.message }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="emit('close')">Cancel</Button>
          <Button :disabled="!canSubmit" @click="submit">{{ submitLabel }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

