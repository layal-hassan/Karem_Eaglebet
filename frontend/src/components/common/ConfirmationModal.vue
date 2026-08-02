<template>
  <Dialog
    :dismissable-mask="true"
    :draggable="false"
    :modal="true"
    :style="{ width: 'min(92vw, 28rem)' }"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="rounded-2xl bg-amber-400/10 p-2 text-amber-300">
          <TriangleAlert class="h-5 w-5" />
        </div>
        <div>
          <p class="text-lg font-bold">{{ title }}</p>
          <p class="muted-text text-sm">{{ description }}</p>
        </div>
      </div>
    </template>

    <div class="mt-4 flex justify-end gap-3">
      <Button class="ghost-button !rounded-2xl !px-5" label="إلغاء" text @click="$emit('cancel')" />
      <Button class="gold-button !rounded-2xl !border-0 !px-5" :label="confirmLabel" @click="$emit('confirm')" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

withDefaults(
  defineProps<{
    visible: boolean
    title: string
    description: string
    confirmLabel?: string
  }>(),
  {
    confirmLabel: 'تأكيد',
  },
)

defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()
</script>
