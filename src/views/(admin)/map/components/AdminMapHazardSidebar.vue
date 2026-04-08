<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, Pencil, Plus, RefreshCcw, Trash2, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TypographyMuted, TypographyP, TypographySmall } from '@/components/typography'
import HazardFormModal from '@/views/(admin)/map/components/HazardFormModal.vue'
import ZoningLayerDeleteDialog from '@/views/(admin)/map/components/ZoningLayerDeleteDialog.vue'
import type { CreateHazardInput, Hazard, HazardId, UpdateHazardInput } from '@/types/hazard.types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    hazards?: Hazard[]
    isEnabled?: boolean
    isLoading?: boolean
    isSubmitting?: boolean
    errorMessage?: string
    selectedHazardId?: HazardId | null
  }>(),
  {
    hazards: () => [],
    isEnabled: false,
    isLoading: false,
    isSubmitting: false,
    errorMessage: '',
    selectedHazardId: null,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
  (e: 'toggle-enabled', enabled: boolean): void
  (e: 'select-hazard', hazardId: HazardId): void
  (e: 'create-hazard', payload: CreateHazardInput): void
  (e: 'update-hazard', payload: { hazardId: HazardId; input: UpdateHazardInput }): void
  (e: 'delete-hazard', hazardId: HazardId): void
}>()

const showAddModal = ref(false)
const editingHazard = ref<Hazard | null>(null)
const deletingHazardId = ref<HazardId | null>(null)

const selectedHazard = computed(() => {
  if (!props.selectedHazardId) {
    return null
  }

  return props.hazards.find((hazard) => hazard.id === props.selectedHazardId) ?? null
})

function openAddModal(): void {
  showAddModal.value = true
}

function openEditModal(hazardId: HazardId): void {
  editingHazard.value = props.hazards.find((hazard) => hazard.id === hazardId) ?? null
}

function closeEditModal(): void {
  editingHazard.value = null
}

function closeAddModal(): void {
  showAddModal.value = false
}

function requestDelete(hazardId: HazardId): void {
  deletingHazardId.value = hazardId
}

function cancelDelete(): void {
  deletingHazardId.value = null
}

function confirmDelete(): void {
  if (!deletingHazardId.value) {
    return
  }

  emit('delete-hazard', deletingHazardId.value)
  deletingHazardId.value = null
}

function submitCreate(payload: CreateHazardInput): void {
  emit('create-hazard', payload)
  showAddModal.value = false
}

function submitUpdate(payload: UpdateHazardInput): void {
  if (!editingHazard.value) {
    return
  }

  emit('update-hazard', {
    hazardId: editingHazard.value.id,
    input: payload,
  })

  editingHazard.value = null
}
</script>

<template>
  <aside
    v-if="props.isOpen"
    class="absolute right-96 top-3 z-9998 w-90 max-w-[calc(100%-1.5rem)]"
  >
    <Card class="max-h-[calc(100vh-10rem)] overflow-hidden py-0">
      <CardHeader class="border-b py-4">
        <CardTitle class="flex items-center justify-between text-base">
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-4 w-4 text-amber-500" />
            <TypographyP as="span" class="m-0 leading-none">Hazards</TypographyP>
            <Badge variant="secondary">{{ props.hazards.length }}</Badge>
          </div>

          <Button variant="ghost" size="icon-sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-3 overflow-y-auto p-4">
        <div class="flex gap-2">
          <Button
            class="flex-1"
            :variant="props.isEnabled ? 'default' : 'outline'"
            :disabled="props.isLoading || props.isSubmitting"
            @click="emit('toggle-enabled', !props.isEnabled)"
          >
            <TypographySmall as="span">{{ props.isEnabled ? 'Hazards Enabled' : 'Enable Hazards' }}</TypographySmall>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            :disabled="props.isLoading || props.isSubmitting"
            @click="emit('refresh')"
          >
            <RefreshCcw class="h-4 w-4" />
          </Button>

          <Button
            size="icon-sm"
            :disabled="props.isLoading || props.isSubmitting"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" />
          </Button>
        </div>

        <TypographyMuted v-if="props.isLoading" as="p" class="text-xs text-muted-foreground">
          Loading hazards...
        </TypographyMuted>

        <TypographySmall v-if="props.errorMessage" as="p" class="text-xs text-destructive">
          {{ props.errorMessage }}
        </TypographySmall>

        <Separator />

        <div v-if="props.hazards.length === 0 && !props.isLoading" class="rounded-md border p-3">
          <TypographySmall as="p" class="text-xs text-muted-foreground">
            No hazards found.
          </TypographySmall>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="hazard in props.hazards"
            :key="hazard.id"
            class="w-full rounded-md border px-3 py-2 transition-colors"
            :class="props.selectedHazardId === hazard.id ? 'border-primary bg-muted/70' : ''"
          >
            <button
              type="button"
              class="w-full text-left"
              @click="emit('select-hazard', hazard.id)"
            >
              <div class="flex items-center gap-2">
                <TypographySmall as="span" class="truncate text-sm font-medium">{{ hazard.name }}</TypographySmall>
                <Badge variant="outline" class="ml-auto text-[10px] uppercase">{{ hazard.severity }}</Badge>
              </div>
              <TypographyMuted as="p" class="mt-1 text-xs text-muted-foreground">
                {{ hazard.category }} • {{ hazard.status }}
              </TypographyMuted>
              <TypographyMuted
                v-if="hazard.location_name"
                as="p"
                class="mt-1 truncate text-xs text-muted-foreground"
              >
                {{ hazard.location_name }}
              </TypographyMuted>
            </button>

            <div class="mt-2 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                :disabled="props.isSubmitting"
                title="Update hazard"
                @click="openEditModal(hazard.id)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                :disabled="props.isSubmitting"
                title="Delete hazard"
                @click="requestDelete(hazard.id)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <HazardFormModal
      :open="showAddModal"
      mode="add"
      :is-submitting="props.isSubmitting"
      @close="closeAddModal"
      @submit-create="submitCreate"
      @submit-update="submitUpdate"
    />

    <HazardFormModal
      :open="Boolean(editingHazard)"
      mode="edit"
      :is-submitting="props.isSubmitting"
      :initial-value="editingHazard"
      @close="closeEditModal"
      @submit-create="submitCreate"
      @submit-update="submitUpdate"
    />

    <ZoningLayerDeleteDialog
      :open="Boolean(deletingHazardId)"
      :is-submitting="props.isSubmitting"
      title="Delete Hazard?"
      description="This action cannot be undone. This will permanently delete the selected hazard."
      confirm-label="Delete"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />

    <div v-if="selectedHazard" class="sr-only">{{ selectedHazard.id }}</div>
  </aside>
</template>

