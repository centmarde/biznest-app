<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type {
  CreateHazardFormInput,
  Hazard,
  HazardGeometry,
  HazardGeometryType,
  HazardSeverity,
  HazardStatus,
  UpdateHazardInput,
} from '@/types/hazard.types'

const severityOptions: HazardSeverity[] = ['low', 'moderate', 'high', 'critical']
const statusOptions: HazardStatus[] = ['reported', 'under_review', 'active', 'mitigated', 'resolved']
const geometryOptions: HazardGeometryType[] = ['point', 'linestring', 'polygon']
const placementLabels: Record<HazardGeometryType, string> = {
  point: 'Pin',
  linestring: 'Draw Line',
  polygon: 'Draw Polygon',
}

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'add' | 'edit'
    isSubmitting?: boolean
    initialValue?: Hazard | null
    placementType?: HazardGeometryType | null
    pointCount?: number
  }>(),
  {
    isSubmitting: false,
    initialValue: null,
    placementType: null,
    pointCount: 0,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-create', payload: CreateHazardFormInput): void
  (e: 'submit-update', payload: UpdateHazardInput): void
}>()

const form = reactive({
  name: '',
  category: '',
  severity: 'low' as HazardSeverity,
  status: 'reported' as HazardStatus,
  location_name: '',
  description: '',
  geometry_type: 'point' as HazardGeometryType,
  coordinatesText: '[125.5406, 8.9475]',
})

const parseError = reactive({
  message: '',
})

const modalTitle = computed(() => (props.mode === 'add' ? 'Add Hazard' : 'Update Hazard'))
const submitLabel = computed(() => (props.mode === 'add' ? 'Create Hazard' : 'Update Hazard'))
const isAddMode = computed(() => props.mode === 'add')
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
    form.geometry_type = 'point'
    form.coordinatesText = ''
  },
  { deep: true, immediate: true },
)

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  )
}

function isLinearRing(value: unknown): value is [number, number][] {
  return Array.isArray(value) && value.length >= 4 && value.every(isCoordinatePair)
}

function buildGeometry(): HazardGeometry | null {
  parseError.message = ''

  try {
    const raw = JSON.parse(form.coordinatesText)

    if (form.geometry_type === 'point') {
      if (!isCoordinatePair(raw)) {
        parseError.message = 'Point coordinates must be [lng, lat].'
        return null
      }

      return {
        type: 'Point',
        coordinates: raw,
      }
    }

    if (form.geometry_type === 'linestring') {
      if (!Array.isArray(raw) || raw.length < 2 || !raw.every(isCoordinatePair)) {
        parseError.message = 'LineString coordinates must be [[lng, lat], ...].'
        return null
      }

      return {
        type: 'LineString',
        coordinates: raw,
      }
    }

    if (!Array.isArray(raw) || raw.length === 0 || !raw.every(isLinearRing)) {
      parseError.message = 'Polygon coordinates must be [[[lng, lat], ...]].'
      return null
    }

    return {
      type: 'Polygon',
      coordinates: raw,
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

  const basePayload = {
    name: form.name.trim(),
    category: form.category.trim(),
    severity: form.severity,
    status: form.status,
    location_name: form.location_name.trim() || null,
    description: form.description.trim() || null,
  }

  if (props.mode === 'add') {
    emit('submit-create', basePayload)
    return
  }

  const geometry = buildGeometry()
  if (!geometry) {
    return
  }

  emit('submit-update', {
    ...basePayload,
    geometry,
    geometry_type: form.geometry_type,
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => { if (!val) emit('close') }">
    <SheetContent
      side="right"
      class="flex flex-col gap-0 p-0 sm:max-w-[41.6667vw] w-full overflow-hidden"
    >
      <SheetHeader class="shrink-0 border-b py-4 px-5 pr-12">
        <SheetTitle class="text-base">{{ modalTitle }}</SheetTitle>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto p-5">
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
              <SelectContent>
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
              <SelectContent>
                <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="isAddMode" class="col-span-2 rounded-md border bg-muted/30 p-3">
            <div class="space-y-1">
              <label class="text-xs font-medium">Placement Type</label>
              <p class="text-sm font-medium">
                {{ placementType ? placementLabels[placementType] : 'No placement selected' }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{
                  placementType === 'point'
                    ? 'Click the map once to place the hazard pin.'
                    : placementType === 'linestring'
                      ? 'Draw the hazard line on the map, then finish to continue.'
                      : 'Draw the hazard polygon on the map, then finish to continue.'
                }}
              </p>
              <p class="text-xs text-muted-foreground">
                Captured points: <span class="font-medium">{{ pointCount }}</span>
              </p>
            </div>
          </div>

          <div v-else class="space-y-1">
            <label class="text-xs font-medium">Geometry Type</label>
            <Select v-model="form.geometry_type">
              <SelectTrigger>
                <SelectValue placeholder="Select geometry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="geometry in geometryOptions" :key="geometry" :value="geometry">
                  {{ placementLabels[geometry] }}
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

          <div v-if="!isAddMode" class="col-span-2 space-y-1">
            <label class="text-xs font-medium">Coordinates (JSON)</label>
            <textarea
              v-model="form.coordinatesText"
              rows="4"
              class="border-input focus-visible:border-ring focus-visible:ring-ring/50 font-mono w-full rounded-md border bg-transparent px-3 py-2 text-xs outline-none focus-visible:ring-[3px]"
              :placeholder="
                form.geometry_type === 'point'
                  ? '[125.5406, 8.9475]'
                  : form.geometry_type === 'linestring'
                    ? '[[125.54, 8.94], [125.55, 8.95]]'
                    : '[[[125.54, 8.94], [125.55, 8.94], [125.55, 8.95], [125.54, 8.94]]]'
              "
            />
            <p v-if="parseError.message" class="text-xs text-destructive">{{ parseError.message }}</p>
          </div>
        </div>
      </div>

      <SheetFooter class="shrink-0 border-t bg-background/95 px-5 py-4">
        <Button variant="outline" @click="emit('close')">Cancel</Button>
        <Button :disabled="!canSubmit" @click="submit">{{ submitLabel }}</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
