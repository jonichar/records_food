<template>
  <a-modal
    :open="open"
    :footer="null"
    :closable="false"
    centered
    :body-style="{ padding: 0, background: '#1e293b', borderRadius: '1.5rem' }"
    width="92vw"
    style="max-width: 420px"
    @cancel="emit('update:open', false)"
  >
    <div class="p-5">
      <!-- Title -->
      <div class="text-center mb-5">
        <div class="text-4xl mb-2">💳</div>
        <h3 class="text-lg font-bold text-white">Confirmar pago</h3>
        <p class="text-slate-400 text-sm mt-1">¿Seguro que deseas cerrar este ciclo?</p>
      </div>

      <!-- Summary -->
      <div class="glass rounded-2xl p-4 mb-5 border border-slate-700/40">
        <div class="flex justify-between items-center mb-2">
          <span class="text-slate-400 text-sm">Items en el ciclo</span>
          <span class="text-white font-medium">{{ cycle?.items?.length || 0 }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-400 text-sm">Total calculado</span>
          <span class="text-2xl font-bold text-white">{{ formatCurrency(total) }}</span>
        </div>
      </div>

      <!-- Amount input -->
      <div class="mb-5">
        <label class="block text-sm text-slate-300 mb-2 font-medium">Monto pagado</label>
        <a-input-number
          v-model:value="paidAmount"
          :min="0"
          placeholder="Ingresa el monto..."
          size="large"
          class="w-full"
          id="input-paid-amount"
        />

        <!-- Difference -->
        <div v-if="paidAmount !== null && paidAmount !== undefined" class="mt-3 p-3 rounded-xl border"
             :class="difference >= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'">
          <div class="flex justify-between items-center">
            <span class="text-sm" :class="difference >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ difference >= 0 ? '✅ Sobra' : '❌ Falta' }}
            </span>
            <span class="font-bold" :class="difference >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ formatCurrency(Math.abs(difference)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="grid grid-cols-2 gap-3">
        <a-button
          block
          size="large"
          @click="emit('update:open', false)"
          id="btn-cancel-payment"
          class="!rounded-2xl !border-slate-600 !text-slate-300"
        >
          Cancelar
        </a-button>
        <a-button
          type="primary"
          block
          size="large"
          :loading="paying"
          :disabled="paidAmount === null || paidAmount === undefined"
          @click="confirmPay"
          id="btn-confirm-payment"
          danger
          class="!rounded-2xl !font-semibold"
          style="background: linear-gradient(135deg, #10b981, #059669)"
        >
          Confirmar pago
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  cycle: Object,
  total: Number,
})
const emit = defineEmits(['update:open', 'paid'])

const paidAmount = ref(null)
const paying = ref(false)

watch(() => props.open, (val) => {
  if (val) paidAmount.value = null
})

const difference = computed(() => (paidAmount.value || 0) - (props.total || 0))

async function confirmPay() {
  paying.value = true
  try {
    emit('paid', paidAmount.value)
  } finally {
    paying.value = false
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>
