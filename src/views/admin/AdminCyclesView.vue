<template>
  <div class="p-4 pb-24 animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl">🔄</div>
      <div>
        <h2 class="font-bold text-lg">Ciclos activos</h2>
        <p class="text-slate-400 text-xs">Todos los usuarios</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12"><a-spin size="large" /></div>

    <div v-else-if="!cycles.length" class="text-center py-12">
      <div class="text-5xl mb-4">😴</div>
      <p class="text-slate-400">No hay ciclos activos</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="cycle in cycles"
        :key="cycle.id"
        class="glass rounded-2xl border border-emerald-500/20 overflow-hidden"
      >
        <!-- Collapsible header -->
        <button
          class="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
          @click="toggleCycle(cycle.id)"
        >
          <div class="text-left flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
              <span class="text-xs text-emerald-400 font-medium">Activo · {{ cycle.users?.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-lg font-bold text-white">{{ formatCurrency(calcTotal(cycle)) }}</p>
              <span class="text-xs text-slate-400">{{ cycle.items?.length || 0 }} item(s)</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Desde {{ formatDate(cycle.started_at) }}</p>
          </div>
          <span
            class="text-slate-400 text-lg transition-transform duration-200 ml-3 flex-shrink-0"
            :class="expanded[cycle.id] ? 'rotate-180' : ''"
          >
            ⌄
          </span>
        </button>

        <!-- Expandable body -->
        <div v-if="expanded[cycle.id]" class="border-t border-slate-700/40 p-4 space-y-3 animate-fade-in">
          <div v-if="cycle.items?.length" class="space-y-2 mb-4">
            <ItemCard
              v-for="item in cycle.items"
              :key="item.id"
              :item="item"
              :delete-only="true"
              @delete="handleDeleteItem"
            />
          </div>

          <a-button
            type="primary"
            block
            @click.stop="initiateClose(cycle)"
            :id="`btn-close-cycle-${cycle.id}`"
            class="!rounded-xl !font-semibold"
            style="background: linear-gradient(135deg, #10b981, #059669)"
          >
            💳 Cerrar ciclo
          </a-button>
        </div>
      </div>
    </div>

    <!-- Payment modal -->
    <PaymentConfirmModal
      v-if="selectedCycle"
      v-model:open="showPayment"
      :cycle="selectedCycle"
      :total="selectedTotal"
      @paid="handlePaid"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCyclesStore } from '@/stores/cycles'
import { message } from 'ant-design-vue'
import ItemCard from '@/components/ItemCard.vue'
import PaymentConfirmModal from '@/components/PaymentConfirmModal.vue'

const cyclesStore = useCyclesStore()
const cycles = ref([])
const loading = ref(true)
const showPayment = ref(false)
const selectedCycle = ref(null)
const selectedTotal = ref(0)
const expanded = reactive({})

onMounted(() => loadCycles())

async function loadCycles() {
  loading.value = true
  try { cycles.value = await cyclesStore.fetchAllActiveCycles() }
  catch (e) { message.error('Error cargando ciclos') }
  finally { loading.value = false }
}

function toggleCycle(id) {
  expanded[id] = !expanded[id]
}

function calcTotal(cycle) { return cyclesStore.calculateCycleTotal(cycle) }

function initiateClose(cycle) {
  selectedCycle.value = cycle
  selectedTotal.value = calcTotal(cycle)
  showPayment.value = true
}

async function handleDeleteItem(itemId) {
  try {
    await cyclesStore.deleteItem(itemId)
    message.success('Item eliminado')
    await loadCycles()
  } catch (e) { message.error('Error eliminando item') }
}

async function handlePaid(paidAmount) {
  try {
    await cyclesStore.closeCycle(selectedCycle.value.id, paidAmount, selectedTotal.value)
    message.success('Ciclo cerrado ✅')
    showPayment.value = false
    selectedCycle.value = null
    await loadCycles()
  } catch (e) { message.error('Error al cerrar ciclo') }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
