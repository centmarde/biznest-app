<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TypographyMuted } from '@/components/typography'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserRow } from '@/views/(admin)/users/types/users-table.types'
import { updateUserProfile } from '@/services/users.service'
import { useAlertContext } from '@/composables/useAlert'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  user: UserRow | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
  (e: 'refresh'): void
  (e: 'updated', user: UserRow): void
}>()

const { showSuccess, showAlert } = useAlertContext()

const username = ref('')
const email = ref('')
const role = ref('user')
const city = ref('')
const isLoading = ref(false)

const PHILIPPINE_CITIES = ref<string[]>([])
const isFetchingCities = ref(false)

const fetchCities = async () => {
  if (PHILIPPINE_CITIES.value.length > 0) return
  try {
    isFetchingCities.value = true
    const response = await fetch('https://psgc.gitlab.io/api/cities')
    if (!response.ok) throw new Error('Failed to fetch cities')
    const data = await response.json()
    PHILIPPINE_CITIES.value = data.map((c: { name: string }) => c.name).sort()
  } catch (error) {
    console.error('Error fetching cities:', error)
  } finally {
    isFetchingCities.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      fetchCities()
    }
  },
  { immediate: true },
)

watch(
  () => props.user,
  (user) => {
    if (user) {
      username.value = user.username
      email.value = user.email
      role.value = user.role.toLowerCase()
      city.value = user.city || ''
    } else {
      username.value = ''
      email.value = ''
      role.value = 'user'
      city.value = ''
    }
  },
  { immediate: true },
)

const closeModal = () => {
  if (isLoading.value) return
  emit('update:isOpen', false)
}

const saveChanges = async () => {
  if (!props.user) return

  try {
    isLoading.value = true
    await updateUserProfile(props.user.id, {
      username: username.value,
      role: role.value,
      city: city.value,
    })

    // Fast local update
    emit('updated', {
      ...props.user,
      username: username.value,
      role: role.value,
      city: city.value,
    })

    emit('update:isOpen', false)
    showSuccess('User profile updated successfully.')
  } catch (error) {
    console.error('Failed to update user:', error)
    emit('update:isOpen', false)
    showAlert({
      title: 'Update Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      tone: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog
    :open="props.isOpen"
    @update:open="
      (val) => {
        if (!isLoading) emit('update:isOpen', val)
      }
    "
  >
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit User Profile</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input id="username" placeholder="Username" v-model="username" :disabled="isLoading" />
        </div>

        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="Email" v-model="email" disabled />
          <TypographyMuted as="p" class="mt-0 text-xs"
            >Email addresses cannot be changed here.</TypographyMuted
          >
        </div>

        <div class="grid gap-2">
          <Label for="role">Role</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                id="role"
                variant="outline"
                class="w-full justify-start font-normal"
                :class="!role && 'text-muted-foreground'"
                :disabled="isLoading"
              >
                {{ role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Select a role' }}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[375px]">
              <DropdownMenuItem @click="role = 'user'">User</DropdownMenuItem>
              <DropdownMenuItem @click="role = 'admin'">Admin</DropdownMenuItem>
              <DropdownMenuItem @click="role = 'superadmin'">Superadmin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div class="grid gap-2">
          <Label for="city">City</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                id="city"
                variant="outline"
                class="w-full justify-start font-normal"
                :class="!city && 'text-muted-foreground'"
                :disabled="isLoading"
              >
                {{ city ? city : 'Select a city' }}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[375px] max-h-[300px] overflow-y-auto">
              <TypographyMuted
                v-if="isFetchingCities"
                as="div"
                class="mt-0 p-4 text-center text-sm"
              >
                <Loader2 class="mr-2 h-4 w-4 animate-spin inline-block" />
                Loading cities...
              </TypographyMuted>
              <template v-else>
                <DropdownMenuItem v-for="c in PHILIPPINE_CITIES" :key="c" @click="city = c">
                  {{ c }}
                </DropdownMenuItem>
              </template>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="closeModal" :disabled="isLoading">Cancel</Button>
        <Button @click="saveChanges" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
