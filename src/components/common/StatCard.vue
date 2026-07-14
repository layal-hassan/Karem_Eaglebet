<template>
  <article class="panel h-full overflow-hidden p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1 space-y-3">
        <p class="metric-label line-clamp-2 leading-7">{{ title }}</p>
        <div class="space-y-1">
          <p class="metric-value break-words text-[clamp(1.9rem,2.4vw,2.35rem)] leading-none">
            {{ value }}
          </p>
          <p
            v-if="secondary"
            class="muted-text break-words text-sm leading-6"
          >
            {{ secondary }}
          </p>
        </div>
      </div>
      <div class="shrink-0 rounded-2xl bg-amber-400/10 p-3 text-[#d5ac57]">
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>
    <div
      v-if="footer"
      class="muted-text mt-4 border-t border-white/5 pt-3 text-sm leading-6"
    >
      {{ footer }}
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  secondary?: string
  footer?: string
  icon: object
}>()
</script>
