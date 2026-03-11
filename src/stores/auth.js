import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)

  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isLoggedIn = computed(() => !!currentUser.value)

  function setUser(user) {
    currentUser.value = user
    if (user) {
      localStorage.setItem('rf_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('rf_user')
    }
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('rf_user')
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored)
      } catch {
        localStorage.removeItem('rf_user')
      }
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  }

  async function createUser(name, role, password = null) {
    const { data, error } = await supabase
      .from('users')
      .insert({ name, role, password })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateUser(id, name, password = undefined) {
    const updates = { name }
    if (password !== undefined) updates.password = password
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  function logout() {
    setUser(null)
  }

  return {
    currentUser,
    isAdmin,
    isLoggedIn,
    setUser,
    loadFromStorage,
    fetchUsers,
    createUser,
    updateUser,
    logout,
  }
})
