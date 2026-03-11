<template>
  <div class="p-4 pb-24 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xl">
        👋
      </div>
      <div>
        <p class="text-slate-400 text-xs">Hola,</p>
        <h2 class="font-bold text-lg leading-tight">{{ auth.currentUser?.name }}</h2>
      </div>
    </div>

    <!-- Active Cycle Card -->
    <div v-if="loading" class="flex justify-center py-12">
      <a-spin size="large" />
    </div>

    <div v-else>
      <!-- No active cycle -->
      <div v-if="!activeCycle" class="text-center py-12">
        <div class="text-6xl mb-4">🍽️</div>
        <h3 class="text-xl font-semibold text-slate-200 mb-2">Sin ciclo activo</h3>
        <p class="text-slate-400 text-sm mb-8">Agrega un platillo para comenzar un nuevo ciclo</p>
        <button
          @click="openAddItem"
          id="btn-add-first-dish"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/30 active:scale-95 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/40"
        >
          <span class="text-xl">➕</span>
          Agregar platillo
        </button>
      </div>

      <!-- Active cycle -->
      <div v-else class="animate-slide-up space-y-4">
        <!-- Cycle summary header -->
        <div class="glass rounded-3xl p-5 border border-slate-700/40">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                <span class="text-xs text-emerald-400 font-medium uppercase tracking-wide">Ciclo activo</span>
              </div>
              <p class="text-slate-400 text-xs">
                Desde {{ formatDate(activeCycle.started_at) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-white">{{ formatCurrency(cycleTotal) }}</p>
              <p class="text-xs text-slate-400">Total acumulado</p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm text-slate-400">
            <span>📋</span>
            <span>{{ activeCycle.items?.length || 0 }} item(s) en este ciclo</span>
          </div>
        </div>

        <!-- Items list -->
        <div v-if="activeCycle.items?.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">Platillos del ciclo</h3>
          <ItemCard
            v-for="item in sortedItems"
            :key="item.id"
            :item="item"
            @edit="openEditItem"
            @delete="handleDeleteItem"
          />
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3 pt-2">
          <button
            @click="openAddItem"
            id="btn-add-dish"
            class="flex-1 flex items-center justify-center gap-2 bg-primary-600/20 border border-primary-500/40 text-primary-300 font-semibold py-4 rounded-2xl active:scale-95 transition-all duration-200 hover:bg-primary-600/30"
          >
            <span class="text-lg">➕</span>
            Agregar platillo
          </button>
          <button
            @click="openPayment"
            id="btn-pay"
            class="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-semibold py-4 rounded-2xl active:scale-95 transition-all duration-200 hover:bg-emerald-600/30"
          >
            <span class="text-lg">💰</span>
            Pagar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <AddItemModal
    v-model:open="showAddItem"
    :editing-item="editingItem"
    @saved="handleItemSaved"
    @updated="handleItemUpdated"
  />
  <PaymentConfirmModal
    v-if="activeCycle"
    v-model:open="showPayment"
    :cycle="activeCycle"
    :total="cycleTotal"
    @paid="handlePaid"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCyclesStore } from '@/stores/cycles'
import { message } from 'ant-design-vue'
import ItemCard from '@/components/ItemCard.vue'
import AddItemModal from '@/components/AddItemModal.vue'
import PaymentConfirmModal from '@/components/PaymentConfirmModal.vue'

const auth = useAuthStore()
const cyclesStore = useCyclesStore()

const activeCycle = ref(null)
const loading = ref(true)
const showAddItem = ref(false)
const showPayment = ref(false)
const editingItem = ref(null)

const cycleTotal = computed(() => cyclesStore.calculateCycleTotal(activeCycle.value))
const sortedItems = computed(() =>
  [...(activeCycle.value?.items || [])].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )
)

onMounted(() => loadCycle())

async function loadCycle() {
  if (!auth.currentUser) return   // guard: user logged out mid-navigation
  loading.value = true
  try {
    activeCycle.value = await cyclesStore.fetchActiveCycle(auth.currentUser.id)
  } catch (e) {
    // only show error if we're still logged in
    if (auth.currentUser) message.error('Error cargando ciclo')
  } finally {
    loading.value = false
  }
}

function openAddItem() {
  editingItem.value = null
  showAddItem.value = true
}

function openEditItem(item) {
  editingItem.value = item
  showAddItem.value = true
}

function openPayment() { showPayment.value = true }

async function handleItemSaved(itemData) {
  try {
    if (!activeCycle.value) {
      activeCycle.value = await cyclesStore.createCycle(auth.currentUser.id)
    }
    await cyclesStore.addItemToCycle(activeCycle.value.id, auth.currentUser.id, itemData)
    message.success('Platillo agregado ✅')
    showAddItem.value = false
    await loadCycle()
  } catch (e) {
    message.error('Error guardando platillo: ' + e.message)
  }
}

async function handleItemUpdated(itemData) {
  try {
    await cyclesStore.updateItem(itemData.id, itemData)
    message.success('Platillo actualizado ✅')
    showAddItem.value = false
    editingItem.value = null
    await loadCycle()
  } catch (e) {
    message.error('Error actualizando: ' + e.message)
  }
}

async function handleDeleteItem(itemId) {
  try {
    await cyclesStore.deleteItem(itemId)
    message.success('Item eliminado')
    await loadCycle()
  } catch (e) {
    message.error('Error eliminando item')
  }
}

async function handlePaid(paidAmount) {
  try {
    await cyclesStore.closeCycle(activeCycle.value.id, paidAmount, cycleTotal.value)
    message.success('Ciclo cerrado exitosamente 🎉')
    showPayment.value = false
    activeCycle.value = null
    await loadCycle()
  } catch (e) {
    message.error('Error cerrando ciclo: ' + e.message)
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
