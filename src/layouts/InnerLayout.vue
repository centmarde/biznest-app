<script setup lang="ts">
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import InnerNavbar from '@/components/InnerNavbar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-far text-foreground">
    <InnerNavbar />
    <SidebarProvider class="flex-1">
      <AdminSidebar />
      <SidebarInset class="p-4 md:p-6">
        <RouterView />
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
