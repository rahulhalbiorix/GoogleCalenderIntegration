import { useAuthStore } from '@/stores/useAuthStore'
import Dashboard from '@/views/Dashboard.vue'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/form',
      name: 'MeetingForm',
      component: () => import('@/views/MeetingForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
  ],
})

//below  logic of navigation guard

router.beforeEach((to, from, next) => {
  const store = useAuthStore()

  const isAuthenticated = !!store.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (isAuthenticated && to.name === 'Login') {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
