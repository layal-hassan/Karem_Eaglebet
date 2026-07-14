<template>
  <div class="panel overflow-hidden">
    <div class="hidden lg:block">
      <PrimeDataTable
        :data-key="dataKey"
        :loading="loading"
        :row-hover="true"
        :value="value"
        class="text-sm"
        responsive-layout="scroll"
      >
        <template #empty>
          <div class="p-6">
            <EmptyState :description="emptyDescription" :title="emptyTitle" />
          </div>
        </template>
        <slot />
      </PrimeDataTable>
    </div>

    <div class="space-y-3 p-4 lg:hidden">
      <slot v-if="itemsLength" name="mobile" />
      <EmptyState v-else :description="emptyDescription" :title="emptyTitle" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import PrimeDataTable from 'primevue/datatable'
import EmptyState from '@/components/common/EmptyState.vue'

withDefaults(
  defineProps<{
    value: T[]
    loading?: boolean
    dataKey?: string
    itemsLength: number
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    loading: false,
    dataKey: 'id',
    emptyTitle: 'لا توجد بيانات',
    emptyDescription: 'جرّب تعديل الفلاتر أو إضافة سجل جديد.',
  },
)
</script>
