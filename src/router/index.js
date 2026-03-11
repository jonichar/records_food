import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true, role: 'user' },
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/ArchiveView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/cycles',
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/cycles',
    name: 'admin-cycles',
    component: () => import('@/views/admin/AdminCyclesView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/AdminUsersView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/tags',
    name: 'admin-tags',
    component: () => import('@/views/admin/AdminTagsView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  auth.loadFromStorage()

  if (to.meta.public) {
    if (auth.isLoggedIn) {
      return next(auth.isAdmin ? '/admin/cycles' : '/home')
    }
    return next()
  }

  if (!auth.isLoggedIn) {
    return next('/')
  }

  if (to.meta.role === 'admin' && !auth.isAdmin) {
    return next('/home')
  }

  next()
})

export default router
