<template>
  <Tag :severity="severity" :value="status" rounded />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { statusSeverity } from '@/utils/formatters'

const props = defineProps<{
  status: string
}>()

const severity = computed(() => statusSeverity(props.status))
</script>
