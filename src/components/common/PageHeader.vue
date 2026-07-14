<template>
  <header class="space-y-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="space-y-3">
        <Breadcrumb class="!p-0" :home="{ icon: 'pi pi-home' }" :model="breadcrumbItems" />
        <div>
          <p v-if="eyebrow" class="eyebrow text-xs font-semibold">{{ eyebrow }}</p>
          <h1 class="text-2xl font-extrabold md:text-3xl">{{ title }}</h1>
          <p v-if="description" class="muted-text mt-2 max-w-3xl text-sm md:text-base">{{ description }}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Breadcrumb from 'primevue/breadcrumb'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    eyebrow?: string
    breadcrumb?: string[]
  }>(),
  {
    description: '',
    eyebrow: '',
    breadcrumb: () => [],
  },
)

const breadcrumbItems = computed(() => props.breadcrumb.map((label) => ({ label })))
</script>
