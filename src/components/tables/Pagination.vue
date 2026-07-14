<template>
  <Paginator
    :first="first"
    :rows="rows"
    :rows-per-page-options="[5, 10, 15, 20]"
    :total-records="totalRecords"
    template="PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown"
    @page="$emit('update:first', $event.first)"
  />
</template>

<script setup lang="ts">
import Paginator from 'primevue/paginator'

defineProps<{
  first: number
  rows: number
  totalRecords: number
}>()

defineEmits<{
  (event: 'update:first', value: number): void
}>()
</script>
