<template>
  <VChart
    autoresize
    class="h-[220px] w-full max-w-full overflow-hidden md:h-[240px]"
    :option="chartOption"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VChart } from './echarts'
import type { DistributionPoint } from '@/types'

const props = defineProps<{
  data: DistributionPoint[]
}>()

const chartOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: {
    bottom: 0,
    textStyle: { color: '#d7dde8' },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '78%'],
      avoidLabelOverlap: true,
      label: {
        color: '#f5f3ef',
        formatter: '{b}: {c}',
      },
      data: props.data,
      color: ['#d5ac57', '#34d399', '#60a5fa'],
    },
  ],
}))
</script>
