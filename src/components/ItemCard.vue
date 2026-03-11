<template>
  <div class="glass rounded-2xl p-4 border border-slate-700/40 animate-slide-up">
    <!-- Item header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4 class="font-semibold text-slate-100 text-sm">{{ item.title || 'Sin título' }}</h4>
        <p class="text-xs text-slate-400 mt-0.5">📅 {{ formatDate(item.item_date) }}</p>
      </div>
      <div class="flex items-center gap-2 ml-3">
        <div class="text-right">
          <p class="font-bold text-white text-base">{{ formatCurrency(itemTotal) }}</p>
          <p class="text-xs text-slate-400">{{ item.quantity }} platillo(s)</p>
        </div>
        <!-- Edit/Delete actions -->
        <div v-if="!readonly" class="flex flex-col gap-1 ml-1">
          <button
            v-if="!deleteOnly"
            @click="emit('edit', item)"
            :id="`btn-edit-item-${item.id}`"
            class="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all active:scale-90"
            title="Editar"
          >
            ✏️
          </button>
          <a-popconfirm
            title="¿Eliminar este item?"
            ok-text="Sí, eliminar"
            cancel-text="No"
            ok-type="danger"
            @confirm="emit('delete', item.id)"
          >
            <button
              :id="`btn-delete-item-${item.id}`"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
              title="Eliminar"
            >
              🗑️
            </button>
          </a-popconfirm>
        </div>
      </div>
    </div>

    <!-- Dishes -->
    <div v-if="item.dishes?.length" class="space-y-1 mb-3">
      <div
        v-for="dish in item.dishes"
        :key="dish.id"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-slate-300">• {{ dish.name }}</span>
        <span class="text-slate-400 font-medium">{{ formatCurrency(dish.price) }}</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="tags.length" class="flex flex-wrap gap-1 mb-2">
      <span
        v-for="t in tags"
        :key="t.id"
        class="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 border border-primary-500/30"
      >
        {{ t.name }}
      </span>
    </div>

    <!-- Comments -->
    <p v-if="item.comments" class="text-xs text-slate-500 italic border-t border-slate-700/50 pt-2 mt-2">
      💬 {{ item.comments }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: Object,
  readonly: { type: Boolean, default: false },
  deleteOnly: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'delete'])

const itemTotal = computed(() =>
  (props.item.dishes || []).reduce((s, d) => s + (parseFloat(d.price) || 0), 0)
)

const tags = computed(() =>
  (props.item.item_tags || []).map(it => it.tags).filter(Boolean)
)

function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
