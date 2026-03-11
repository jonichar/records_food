<template>
  <div class="p-4 pb-24 animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-xl">
        📂
      </div>
      <div>
        <h2 class="font-bold text-lg">Archivo</h2>
        <p class="text-slate-400 text-xs">Ciclos cerrados</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <a-spin size="large" />
    </div>

    <div v-else-if="!cycles.length" class="text-center py-12">
      <div class="text-5xl mb-4">📭</div>
      <p class="text-slate-400">No hay ciclos cerrados aún</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="cycle in cycles"
        :key="cycle.id"
        class="glass rounded-2xl border border-slate-700/40 overflow-hidden"
      >
        <!-- Collapsible header (always visible) -->
        <button
          class="w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-700/20 transition-colors"
          @click="toggleCycle(cycle.id)"
        >
          <!-- Left: user + date -->
          <div class="text-left flex-1 min-w-0">
            <div v-if="auth.isAdmin" class="text-xs text-primary-400 font-medium mb-1 truncate">
              👤 {{ cycle.users?.name }}
            </div>
            <p class="text-xs text-slate-400">
              Cerrado: {{ formatDate(cycle.closed_at) }} · {{ cycle.items?.length || 0 }} item(s)
            </p>
          </div>

          <!-- Right: total + diff badge -->
          <div class="flex flex-col items-end flex-shrink-0">
            <p class="text-base font-bold text-white leading-tight">{{ formatCurrency(cycle.calculated_total) }}</p>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium mt-1 whitespace-nowrap"
              :class="diffOf(cycle) >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'"
            >
              {{ diffOf(cycle) >= 0 ? '✅' : '❌' }} {{ formatCurrency(Math.abs(diffOf(cycle))) }}
            </span>
          </div>

          <!-- Chevron -->
          <span
            class="text-slate-400 text-lg transition-transform duration-200 flex-shrink-0"
            :class="expanded[cycle.id] ? 'rotate-180' : ''"
          >
            ⌄
          </span>
        </button>

        <!-- Expandable body -->
        <div v-if="expanded[cycle.id]" class="border-t border-slate-700/40 p-4 space-y-3 animate-fade-in">
          <!-- Payment comparison row -->
          <div class="flex items-center justify-between py-2 px-3 rounded-xl"
               :class="diffOf(cycle) >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'">
            <div>
              <p class="text-xs text-slate-400">Monto pagado</p>
              <p class="font-semibold" :class="diffOf(cycle) >= 0 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatCurrency(cycle.paid_amount) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-400">{{ diffOf(cycle) >= 0 ? 'Sobró' : 'Faltó' }}</p>
              <p class="font-semibold text-sm" :class="diffOf(cycle) >= 0 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatCurrency(Math.abs(diffOf(cycle))) }}
              </p>
            </div>
          </div>

          <!-- Items -->
          <div v-if="cycle.items?.length" class="space-y-2">
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Platillos</p>
            <ItemCard v-for="item in cycle.items" :key="item.id" :item="item" :readonly="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCyclesStore } from '@/stores/cycles'
import { message } from 'ant-design-vue'
import ItemCard from '@/components/ItemCard.vue'

const auth = useAuthStore()
const cyclesStore = useCyclesStore()
const cycles = ref([])
const loading = ref(true)
const expanded = reactive({})

onMounted(async () => {
  try {
    const userId = auth.isAdmin ? null : auth.currentUser.id
    cycles.value = await cyclesStore.fetchArchivedCycles(userId)
  } catch (e) {
    message.error('Error cargando archivo')
  } finally {
    loading.value = false
  }
})

function toggleCycle(id) {
  expanded[id] = !expanded[id]
}

function diffOf(cycle) {
  return (cycle.paid_amount || 0) - (cycle.calculated_total || 0)
}
function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0)
}
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
