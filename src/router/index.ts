import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import OuterLayout from '@/layouts/OuterLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import InnerLayout from '@/layouts/InnerLayout.vue'
import LandingView from '@/views/landing/LandingView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import RegisterView from '@/views/auth/register/RegisterView.vue'
import TestView from '@/views/test/TestView.vue'
import AdminMap from '@/views/admin/admin_map/AdminMap.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: OuterLayout,
      children: [
        {
          path: '',
          name: 'landing',
          component: LandingView,
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
          meta: { requiresGuest: true },
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/admin',
      component: InnerLayout,
      children: [
        {
          path: '',
          name: 'test',
          component: TestView,
          meta: { requiresAuth: true },
        },
        {
          path: 'map',
          name: 'admin-map',
          component: AdminMap,
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
})

// 3. Set up the Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for Supabase to finish checking the initial session on page load
  if (!authStore.isInitialized) {
    // We wait for a tiny fraction of a second for the async getSession to finish
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe((mutation, state) => {
        if (state.isInitialized) {
          unwatch()
          resolve(true)
        }
      })
    })
  }

  const isAuthenticated = authStore.isLoggedIn

  // If the route requires auth and the user is NOT logged in -> send to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // If the route requires them to be a guest (like the login page) and they ARE logged in -> send to home
  else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'test' })
  }
  // Otherwise, let them proceed normally
  else {
    next()
  }
})

export default router
