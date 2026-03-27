<script setup lang="ts">
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { TypographyLarge, TypographyMuted, TypographySmall } from '@/components/typography'
import type { AdminSidebarIconName } from '@/types/admin-sidebar.types'
import { managementAdminNavItems, primaryAdminNavItems } from '@/utils/admin-sidebar-nav'

const route = useRoute()

const iconMap: Record<AdminSidebarIconName, Component> = {
  dashboard: LayoutDashboard,
  map: Map,
  report: FileText,
  analytics: BarChart3,
  users: Users,
  roles: Shield,
  notifications: Bell,
  settings: Settings,
}

const isActive = (itemPath: string): boolean => {
  if (itemPath === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(itemPath)
}

const getNavItemClass = (itemPath: string): string => {
  if (isActive(itemPath)) {
    return 'bg-foreground/14 text-foreground ring-1 ring-foreground/25'
  }

  return 'text-foreground/75 hover:bg-foreground/8 hover:text-foreground'
}
</script>

<template>
  <aside class="hidden w-72 shrink-0 border-r bg-card/70 md:block">
    <div class="flex h-full flex-col">
      <div class="border-b px-6 py-5">
        <TypographyLarge as="h2" class="text-base tracking-wide">Admin Panel</TypographyLarge>
        <TypographyMuted as="p" class="mt-1 text-xs">Manage your operations</TypographyMuted>
      </div>

      <nav class="flex-1 space-y-6 px-4 py-5">
        <section>
          <TypographySmall
            as="p"
            class="px-2 pb-2 text-xs tracking-wider text-foreground/60 uppercase"
          >
            Overview
          </TypographySmall>
          <ul class="space-y-1">
            <li v-for="item in primaryAdminNavItems" :key="item.to">
              <RouterLink
                :to="item.to"
                class="focus-visible:ring-ring flex items-center gap-3 rounded-md px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                :class="getNavItemClass(item.to)"
              >
                <component :is="iconMap[item.icon]" class="h-4 w-4 shrink-0" />
                <TypographySmall as="span" class="text-sm text-inherit">{{
                  item.label
                }}</TypographySmall>
              </RouterLink>
            </li>
          </ul>
        </section>

        <section>
          <TypographySmall
            as="p"
            class="px-2 pb-2 text-xs tracking-wider text-foreground/60 uppercase"
          >
            Administration
          </TypographySmall>
          <ul class="space-y-1">
            <li v-for="item in managementAdminNavItems" :key="item.to">
              <RouterLink
                :to="item.to"
                class="focus-visible:ring-ring flex items-center gap-3 rounded-md px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                :class="getNavItemClass(item.to)"
              >
                <component :is="iconMap[item.icon]" class="h-4 w-4 shrink-0" />
                <TypographySmall as="span" class="text-sm text-inherit">{{
                  item.label
                }}</TypographySmall>
              </RouterLink>
            </li>
          </ul>
        </section>
      </nav>
    </div>
  </aside>
</template>
