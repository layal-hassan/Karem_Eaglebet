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
import type { TrendPoint } from '@/types'

const props = defineProps<{
  data: TrendPoint[]
}>()

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    textStyle: { color: '#d7dde8' },
  },
  grid: {
    top: 40,
    left: 20,
    right: 20,
    bottom: 20,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLabel: { color: '#9aa3b2' },
    data: props.data.map((item) => item.date.slice(5)),
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#9aa3b2',
      formatter: (value: number) =>
        new Intl.NumberFormat('en', {
          notation: value >= 1000 ? 'compact' : 'standard',
          maximumFractionDigits: 1,
        }).format(value),
    },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
  },
  series: [
    {
      name: 'الشراء',
      type: 'line',
      smooth: 0.22,
      connectNulls: false,
      showSymbol: false,
      data: props.data.map((item) => (item.purchases > 0 ? item.purchases : null)),
      areaStyle: { color: 'rgba(213, 172, 87, 0.15)' },
      lineStyle: { color: '#d5ac57', width: 3 },
      itemStyle: { color: '#d5ac57' },
    },
    {
      name: 'الدفعات',
      type: 'line',
      smooth: 0.22,
      connectNulls: false,
      showSymbol: false,
      data: props.data.map((item) => (item.payments > 0 ? item.payments : null)),
      areaStyle: { color: 'rgba(52, 211, 153, 0.12)' },
      lineStyle: { color: '#34d399', width: 3 },
      itemStyle: { color: '#34d399' },
    },
  ],
}))
</script>
