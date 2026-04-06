<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const roleName = ref('')
const roleDescription = ref('')

const resetForm = (): void => {
  roleName.value = ''
  roleDescription.value = ''
}

const onOpenChange = (open: boolean): void => {
  if (!open) {
    resetForm()
  }

  emit('update:isOpen', open)
}

const handleCreate = (): void => {
  resetForm()
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="props.isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add Role</DialogTitle>
        <DialogDescription>
          Define a new role and set a clear description for your access policy.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="role-name">Role Name</Label>
          <Input id="role-name" v-model="roleName" placeholder="e.g. Operations Manager" />
        </div>

        <div class="grid gap-2">
          <Label for="role-description">Description</Label>
          <Input
            id="role-description"
            v-model="roleDescription"
            placeholder="Briefly describe the role responsibility"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="onOpenChange(false)">Cancel</Button>
        <Button @click="handleCreate">Create Role</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
