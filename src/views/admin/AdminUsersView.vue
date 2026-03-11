<template>
  <div class="p-4 pb-24 animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl">👥</div>
      <div>
        <h2 class="font-bold text-lg">Usuarios</h2>
        <p class="text-slate-400 text-xs">Gestión de usuarios</p>
      </div>
    </div>

    <!-- Create user form -->
    <div class="glass rounded-2xl p-4 border border-slate-700/40 mb-6">
      <h3 class="font-semibold text-slate-200 mb-4 text-sm">➕ Nuevo usuario</h3>
      <a-form layout="vertical" :model="form">
        <a-form-item label="Nombre">
          <a-input v-model:value="form.name" placeholder="Nombre del usuario" id="input-user-name" />
        </a-form-item>
        <a-form-item label="Rol">
          <a-select v-model:value="form.role" id="select-user-role">
            <a-select-option value="user">👤 Usuario</a-select-option>
            <a-select-option value="admin">⭐ Administrador</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="form.role === 'admin' ? 'Contraseña (requerida para admin)' : 'Contraseña (opcional)'">
          <a-input-password
            v-model:value="form.password"
            :placeholder="form.role === 'admin' ? 'Obligatoria para administradores' : 'Dejar vacío si no requiere contraseña'"
            id="input-user-password"
          />
          <p v-if="form.role === 'admin'" class="text-amber-400/80 text-xs mt-1">
            ⚠️ Los administradores deben tener contraseña
          </p>
        </a-form-item>
        <a-button
          type="primary"
          block
          :loading="saving"
          @click="createUser"
          id="btn-create-user"
          class="!rounded-xl !font-semibold"
          style="background: linear-gradient(135deg, #6366f1, #9333ea)"
        >
          Crear usuario
        </a-button>
      </a-form>
    </div>

    <!-- Users list -->
    <div v-if="loadingUsers" class="flex justify-center py-8"><a-spin /></div>
    <div v-else class="space-y-3">
      <h3 class="text-xs text-slate-500 font-semibold uppercase tracking-wide px-1">Usuarios registrados ({{ users.length }})</h3>
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-3 glass rounded-2xl p-4 border border-slate-700/30"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
          :class="user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-primary-500 to-purple-600'"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1">
          <p class="font-medium text-slate-100">{{ user.name }}</p>
          <p class="text-xs mt-0.5 flex items-center gap-2">
            <span v-if="user.role === 'admin'" class="text-amber-400">⭐ Administrador</span>
            <span v-else class="text-primary-400">👤 Usuario</span>
            <span v-if="user.password" class="text-emerald-400 text-xs">🔒 Con clave</span>
            <span v-else-if="user.role !== 'admin'" class="text-slate-500 text-xs">Sin clave</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'

const auth = useAuthStore()
const users = ref([])
const loadingUsers = ref(true)
const saving = ref(false)
const form = reactive({ name: '', role: 'user', password: '' })

onMounted(() => loadUsers())

async function loadUsers() {
  loadingUsers.value = true
  try { users.value = await auth.fetchUsers() }
  catch (e) { message.error('Error cargando usuarios') }
  finally { loadingUsers.value = false }
}

async function createUser() {
  if (!form.name.trim()) return message.warning('Ingresa un nombre')
  if (form.role === 'admin' && !form.password.trim()) {
    return message.warning('⚠️ Los administradores deben tener contraseña')
  }
  saving.value = true
  try {
    await auth.createUser(form.name.trim(), form.role, form.password.trim() || null)
    message.success('Usuario creado ✅')
    form.name = ''
    form.role = 'user'
    form.password = ''
    await loadUsers()
  } catch (e) {
    message.error('Error: ' + e.message)
  } finally {
    saving.value = false
  }
}
</script>
