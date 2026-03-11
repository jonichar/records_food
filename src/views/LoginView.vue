<template>
  <div class="min-h-dvh bg-surface-900 flex flex-col items-center justify-center p-6 animate-fade-in">
    <div class="w-full max-w-sm">
      <!-- Logo / Header -->
      <div class="text-center mb-10">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl shadow-primary-500/30">
          🍽️
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
          Records Food
        </h1>
        <p class="text-slate-400 mt-2 text-sm">Selecciona tu usuario para continuar</p>
      </div>

      <!-- User list -->
      <div class="space-y-3">
        <div v-if="loading" class="text-center py-8">
          <a-spin size="large" />
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8">
          <p class="text-slate-400 text-sm">No hay usuarios registrados.</p>
          <p class="text-slate-500 text-xs mt-1">Contacta al administrador.</p>
        </div>

        <button
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user)"
          :id="`btn-user-${user.id}`"
          class="w-full flex items-center gap-4 p-4 rounded-2xl glass border border-slate-700/40 hover:border-primary-500/50 active:scale-95 transition-all duration-200 group"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg"
               :class="user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-primary-500 to-purple-600'">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 text-left">
            <p class="font-semibold text-slate-100 group-hover:text-white">{{ user.name }}</p>
            <p class="text-xs text-slate-400 capitalize mt-0.5">
              <span v-if="user.role === 'admin'" class="text-amber-400">⭐ Administrador</span>
              <span v-else class="text-primary-400">👤 Usuario</span>
            </p>
          </div>
          <span class="text-slate-500 group-hover:text-primary-400 transition-colors">›</span>
        </button>
      </div>

      <p class="text-slate-600 text-xs mt-10 text-center">Records Food v1.0</p>
    </div>

    <!-- Password modal -->
    <a-modal
      :open="showPasswordModal"
      :footer="null"
      :closable="false"
      centered
      :body-style="{ padding: 0, background: '#1e293b', borderRadius: '1.5rem' }"
      width="92vw"
      style="max-width: 380px"
    >
      <div class="p-5">
        <div class="text-center mb-5">
          <div class="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-lg"
               :class="pendingUser?.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-primary-500 to-purple-600'">
            {{ pendingUser?.name?.charAt(0).toUpperCase() }}
          </div>
          <h3 class="text-lg font-bold text-white">{{ pendingUser?.name }}</h3>
          <p class="text-slate-400 text-sm mt-1">Ingresa tu contraseña</p>
        </div>

        <a-input-password
          v-model:value="passwordInput"
          placeholder="Contraseña..."
          size="large"
          :status="passwordError ? 'error' : ''"
          @pressEnter="confirmPassword"
          id="input-password"
          class="mb-2"
        />
        <p v-if="passwordError" class="text-red-400 text-xs mb-3">❌ Contraseña incorrecta</p>

        <div class="grid grid-cols-2 gap-3 mt-4">
          <a-button
            block
            size="large"
            @click="cancelPassword"
            class="!rounded-xl !border-slate-600 !text-slate-300"
          >
            Cancelar
          </a-button>
          <a-button
            type="primary"
            block
            size="large"
            :loading="checkingPassword"
            @click="confirmPassword"
            id="btn-confirm-password"
            class="!rounded-xl !font-semibold"
            style="background: linear-gradient(135deg, #6366f1, #9333ea)"
          >
            Entrar
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'

const auth = useAuthStore()
const router = useRouter()

const users = ref([])
const loading = ref(true)
const showPasswordModal = ref(false)
const pendingUser = ref(null)
const passwordInput = ref('')
const passwordError = ref(false)
const checkingPassword = ref(false)

onMounted(async () => {
  try {
    users.value = await auth.fetchUsers()
  } catch (e) {
    message.error('Error cargando usuarios')
  } finally {
    loading.value = false
  }
})

function selectUser(user) {
  // Users with a password (or admin role) require password check
  if (user.role === 'admin' || user.password) {
    pendingUser.value = user
    passwordInput.value = ''
    passwordError.value = false
    showPasswordModal.value = true
  } else {
    loginAs(user)
  }
}

async function confirmPassword() {
  if (!passwordInput.value) return
  checkingPassword.value = true
  passwordError.value = false

  await new Promise(r => setTimeout(r, 300))

  // Validate against whatever is stored in DB — no hardcoded fallbacks
  const valid = passwordInput.value === pendingUser.value.password

  if (valid) {
    showPasswordModal.value = false
    loginAs(pendingUser.value)
  } else {
    passwordError.value = true
  }
  checkingPassword.value = false
}

function cancelPassword() {
  showPasswordModal.value = false
  pendingUser.value = null
  passwordInput.value = ''
  passwordError.value = false
}

function loginAs(user) {
  auth.setUser(user)
  if (user.role === 'admin') {
    router.push('/admin/cycles')
  } else {
    router.push('/home')
  }
}
</script>
