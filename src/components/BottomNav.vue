<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/60"
       style="padding-bottom: env(safe-area-inset-bottom)">
    <div class="flex items-center justify-around px-2 py-2">
      <!-- User nav -->
      <template v-if="!auth.isAdmin">
        <NavItem to="/home" icon="🏠" label="Inicio" />
        <NavItem to="/archive" icon="📂" label="Archivo" />
      </template>
      <!-- Admin nav -->
      <template v-else>
        <NavItem to="/admin/cycles" icon="🔄" label="Ciclos" />
        <NavItem to="/admin/users" icon="👥" label="Usuarios" />
        <NavItem to="/admin/tags" icon="🏷️" label="Tags" />
        <NavItem to="/archive" icon="📂" label="Archivo" />
      </template>

      <!-- Profile/logout -->
      <button
        @click="handleLogout"
        class="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 text-slate-400 hover:text-red-400 active:scale-95"
        id="btn-logout"
      >
        <span class="text-xl">🚪</span>
        <span class="text-xs font-medium">Salir</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavItem from './NavItem.vue'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
