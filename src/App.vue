<template>
  <a-config-provider :theme="darkTheme">
    <div id="app-root" class="min-h-dvh bg-surface-900 text-slate-100 flex flex-col">
      <router-view v-if="!showLayout" />
      <template v-else>
        <!-- Centered max-width wrapper for desktop-->
        <div class="flex-1 flex flex-col w-full max-w-lg mx-auto relative">
          <main class="flex-1 overflow-y-auto safe-bottom">
            <router-view />
          </main>
          <BottomNav />
        </div>
      </template>
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { theme } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const auth = useAuthStore()

const showLayout = computed(() =>
  route.meta.requiresAuth && auth.isLoggedIn
)

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorBgContainer: '#1e293b',
    colorBgElevated: '#293548',
    colorBorder: '#334155',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    borderRadius: 12,
    fontFamily: 'Inter, sans-serif',
  },
}
</script>
