import { createRouter, createWebHistory } from 'vue-router'
import OuterLayout from '@/layouts/OuterLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LandingView from '@/views/landing/LandingView.vue'
import LoginView from '@/views/auth/LoginView.vue'

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
        },
      ],
    },
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
        },
      ],
    },
  ],
})

export default router
