<template>
  <Drawer
    :position="position"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div>
        <p class="text-xl font-bold">{{ title }}</p>
        <p v-if="description" class="muted-text mt-1 text-sm">{{ description }}</p>
      </div>
    </template>
    <slot />
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from 'primevue/drawer'

withDefaults(
  defineProps<{
    visible: boolean
    title: string
    description?: string
    position?: 'left' | 'right' | 'top' | 'bottom' | 'full'
  }>(),
  {
    description: '',
    position: 'left',
  },
)

defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()
</script>
