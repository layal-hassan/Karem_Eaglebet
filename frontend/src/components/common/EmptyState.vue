<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/3 px-6 py-10 text-center">
    <component :is="resolvedIcon" class="h-10 w-10 text-[#d5ac57]" />
    <div>
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <p class="muted-text mt-1 text-sm">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description: string
  icon?: unknown
}>()

const resolvedIcon = computed(() => props.icon ?? Inbox)
</script>
