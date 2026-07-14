<template>
  <Calendar
    :model-value="modelValue"
    aria-label="اختيار الفترة"
    class="w-full"
    date-format="yy/mm/dd"
    icon-display="input"
    selection-mode="range"
    show-icon
    @update:model-value="$emit('update:modelValue', ($event as Date[] | null) ?? null)"
  />
</template>

<script setup lang="ts">
import Calendar from 'primevue/calendar'

defineProps<{
  modelValue: Date[] | null
}>()

defineEmits<{
  (event: 'update:modelValue', value: Date[] | null): void
}>()
</script>
