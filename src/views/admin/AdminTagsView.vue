<template>
  <div class="p-4 pb-24 animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl">🏷️</div>
      <div>
        <h2 class="font-bold text-lg">Tags</h2>
        <p class="text-slate-400 text-xs">Gestión de etiquetas</p>
      </div>
    </div>

    <!-- Create tag form -->
    <div class="glass rounded-2xl p-4 border border-slate-700/40 mb-6">
      <h3 class="font-semibold text-slate-200 mb-4 text-sm">➕ Nuevo tag</h3>
      <div class="flex gap-3">
        <a-input
          v-model:value="newTagName"
          placeholder="Nombre del tag..."
          @pressEnter="createTag"
          id="input-tag-name"
          class="flex-1"
        />
        <a-button
          type="primary"
          :loading="saving"
          @click="createTag"
          id="btn-create-tag"
          class="!rounded-xl !font-semibold flex-shrink-0"
          style="background: linear-gradient(135deg, #6366f1, #9333ea)"
        >
          Crear
        </a-button>
      </div>
    </div>

    <!-- Tags list -->
    <div v-if="loading" class="flex justify-center py-8"><a-spin /></div>
    <div v-else>
      <div v-if="!tags.length" class="text-center py-8">
        <p class="text-slate-400 text-sm">No hay tags aún. ¡Crea el primero!</p>
      </div>
      <div v-else>
        <h3 class="text-xs text-slate-500 font-semibold uppercase tracking-wide px-1 mb-3">Tags creados ({{ tags.length }})</h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="group flex items-center gap-2 px-4 py-2 rounded-full glass border border-slate-700/40 hover:border-red-500/40 transition-all"
          >
            <span class="text-slate-200 text-sm font-medium">{{ tag.name }}</span>
            <button
              @click="deleteTag(tag.id)"
              :id="`btn-delete-tag-${tag.id}`"
              class="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs leading-none"
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { message } from 'ant-design-vue'

const tagsStore = useTagsStore()
const tags = ref([])
const loading = ref(true)
const saving = ref(false)
const newTagName = ref('')

onMounted(() => loadTags())

async function loadTags() {
  loading.value = true
  try { tags.value = await tagsStore.fetchTags() }
  catch (e) { message.error('Error cargando tags') }
  finally { loading.value = false }
}

async function createTag() {
  if (!newTagName.value.trim()) return message.warning('Ingresa un nombre para el tag')
  saving.value = true
  try {
    await tagsStore.createTag(newTagName.value.trim())
    message.success('Tag creado ✅')
    newTagName.value = ''
    await loadTags()
  } catch (e) {
    if (e.message.includes('unique')) message.error('Ese tag ya existe')
    else message.error('Error al crear tag')
  } finally {
    saving.value = false
  }
}

async function deleteTag(id) {
  try {
    await tagsStore.deleteTag(id)
    tags.value = tags.value.filter(t => t.id !== id)
    message.success('Tag eliminado')
  } catch (e) {
    message.error('Error eliminando tag')
  }
}
</script>
