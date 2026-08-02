<template>
  <Tag :severity="currency === 'USD' ? 'warn' : 'info'" :value="formattedValue" rounded />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import { computed } from 'vue'
import type { CurrencyCode } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps<{
  amount: number
  currency: CurrencyCode
}>()

const formattedValue = computed(() => formatCurrency(props.amount, props.currency))
</script>
