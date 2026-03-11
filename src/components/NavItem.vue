<template>
  <router-link
    :to="to"
    class="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200"
    :class="isActive
      ? 'bg-primary-600/20 text-primary-400'
      : 'text-slate-400 hover:text-slate-200 active:scale-95'"
  >
    <span class="text-xl">{{ icon }}</span>
    <span class="text-xs font-medium">{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: String,
  icon: String,
  label: String,
})

const route = useRoute()
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + '/'))
</script>
