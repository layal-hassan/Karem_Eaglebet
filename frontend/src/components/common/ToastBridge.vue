<template>
  <span v-if="false" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAppStore } from '@/stores/app'

const toast = useToast()
const appStore = useAppStore()

watch(
  () => appStore.toastQueue.length,
  (length) => {
    if (!length) return

    for (const item of appStore.consumeToasts()) {
      toast.add({
        severity: item.severity,
        summary: item.summary,
        detail: item.detail,
        life: item.life ?? 4000,
      })
    }
  },
)
</script>
