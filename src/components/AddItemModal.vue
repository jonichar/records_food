<template>
  <a-modal
    :open="open"
    :footer="null"
    :closable="false"
    centered
    :body-style="{ padding: 0, background: '#1e293b', borderRadius: '1.25rem', overflow: 'hidden' }"
    width="min(95vw, 520px)"
    @cancel="emit('update:open', false)"
  >
    <div class="flex flex-col" style="max-height: 90dvh;">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 flex-shrink-0">
        <h2 class="text-lg font-bold">{{ editingItem ? '✏️ Editar platillo' : '➕ Agregar platillo' }}</h2>
        <button @click="emit('update:open', false)" class="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-700 transition-all">✕</button>
      </div>

      <!-- Scrollable form body -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <a-form layout="vertical" :model="form">
          <!-- Title -->
          <a-form-item label="Título del item" class="mb-4">
            <a-input
              v-model:value="form.title"
              placeholder="Ej: Almuerzo del lunes"
              id="input-item-title"
            />
          </a-form-item>

          <!-- Date & Quantity row -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <a-form-item label="Fecha" class="mb-0">
              <a-date-picker
                v-model:value="form.date"
                class="w-full"
                placeholder="Seleccionar"
                format="DD/MM/YYYY"
                id="input-item-date"
              />
            </a-form-item>
            <a-form-item label="Cantidad" class="mb-0">
              <a-input-number
                v-model:value="form.quantity"
                :min="1"
                :max="50"
                class="w-full"
                id="input-item-quantity"
              />
            </a-form-item>
          </div>

          <!-- Tags -->
          <a-form-item label="Tags" class="mb-4">
            <a-select
              v-model:value="form.tagIds"
              mode="multiple"
              placeholder="Seleccionar tags..."
              :options="tagOptions"
              id="select-item-tags"
            />
          </a-form-item>

          <!-- Comments -->
          <a-form-item label="Comentarios" class="mb-5">
            <a-textarea
              v-model:value="form.comments"
              :rows="2"
              placeholder="Notas adicionales..."
              id="input-item-comments"
            />
          </a-form-item>

          <!-- Dishes section -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-slate-200 text-sm">🍽️ Platillos</h3>
              <button
                type="button"
                @click="addDish"
                id="btn-add-dish-row"
                class="text-xs text-primary-400 border border-primary-500/40 px-3 py-1.5 rounded-xl hover:bg-primary-600/10 active:scale-95 transition-all"
              >
                + Agregar
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(dish, index) in form.dishes"
                :key="index"
                class="flex items-center gap-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30"
              >
                <div class="flex-1">
                  <a-input
                    v-model:value="dish.name"
                    :placeholder="'Platillo ' + (index + 1)"
                    size="small"
                    :id="`input-dish-name-${index}`"
                  />
                </div>
                <div class="w-28">
                  <a-input-number
                    v-model:value="dish.price"
                    :min="0"
                    placeholder="Precio"
                    size="small"
                    class="w-full"
                    :id="`input-dish-price-${index}`"
                  />
                </div>
                <button
                  type="button"
                  @click="removeDish(index)"
                  v-if="form.dishes.length > 1"
                  class="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 w-6"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Running total -->
            <div class="text-right mt-3">
              <p class="text-sm text-slate-400">
                Subtotal: <span class="text-white font-bold">{{ formatCurrency(runningTotal) }}</span>
              </p>
            </div>
          </div>
        </a-form>
      </div>

      <!-- Fixed footer -->
      <div class="px-5 py-4 border-t border-slate-700/60 flex-shrink-0">
        <a-button
          type="primary"
          block
          size="large"
          :loading="saving"
          @click="handleSave"
          id="btn-save-item"
          class="!rounded-2xl !h-12 !text-base !font-semibold"
          style="background: linear-gradient(135deg, #6366f1, #9333ea)"
        >
          {{ editingItem ? 'Guardar cambios' : 'Guardar platillo' }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const props = defineProps({
  open: Boolean,
  editingItem: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved', 'updated'])

const tagsStore = useTagsStore()
const tagOptions = ref([])
const saving = ref(false)

const defaultForm = () => ({
  title: '',
  date: dayjs(),
  quantity: 1,
  tagIds: [],
  comments: '',
  dishes: [{ name: '', price: null }],
})

const form = ref(defaultForm())

onMounted(async () => {
  const tags = await tagsStore.fetchTags()
  tagOptions.value = tags.map(t => ({ label: t.name, value: t.id }))
})

watch(() => props.open, (val) => {
  if (val) {
    if (props.editingItem) {
      const item = props.editingItem
      form.value = {
        title: item.title || '',
        date: item.item_date ? dayjs(item.item_date) : dayjs(),
        quantity: item.quantity || 1,
        comments: item.comments || '',
        tagIds: (item.item_tags || []).map(it => it.tag_id || it.tags?.id).filter(Boolean),
        dishes: (item.dishes || []).length > 0
          ? item.dishes.map(d => ({ name: d.name, price: d.price }))
          : [{ name: '', price: null }],
      }
    } else {
      form.value = defaultForm()
    }
  }
})

const runningTotal = computed(() =>
  form.value.dishes.reduce((s, d) => s + (parseFloat(d.price) || 0), 0)
)

function addDish() { form.value.dishes.push({ name: '', price: null }) }
function removeDish(index) { form.value.dishes.splice(index, 1) }

async function handleSave() {
  if (!form.value.date) return message.warning('Selecciona la fecha')
  const validDishes = form.value.dishes.filter(d => d.name?.trim())
  if (!validDishes.length) return message.warning('Agrega al menos un platillo con nombre')

  saving.value = true
  const payload = {
    title: form.value.title,
    date: form.value.date.format('YYYY-MM-DD'),
    quantity: form.value.quantity,
    tagIds: form.value.tagIds,
    comments: form.value.comments,
    dishes: validDishes,
  }
  try {
    if (props.editingItem) emit('updated', { id: props.editingItem.id, ...payload })
    else emit('saved', payload)
  } finally {
    saving.value = false
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>
