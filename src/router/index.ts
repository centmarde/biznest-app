import { createRouter, createWebHistory } from 'vue-router'
import InnerLayout from '@/layouts/InnerLayout.vue'
import OuterLayout from '@/layouts/OuterLayout.vue'
import LandingView from '@/views/landing/LandingView.vue'

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
  ],
})

export default router
