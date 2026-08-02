<template>
  <IconField icon-position="right" class="w-full">
    <InputIcon>
      <Search class="h-4 w-4" />
    </InputIcon>
    <InputText
      :model-value="modelValue"
      aria-label="بحث"
      class="w-full"
      :placeholder="placeholder"
      @update:model-value="$emit('update:modelValue', String($event))"
    />
  </IconField>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'ابحث هنا',
  },
)

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>
