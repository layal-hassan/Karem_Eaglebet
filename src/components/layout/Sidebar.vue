<template>
  <aside class="flex h-full flex-col gap-6 p-5">
    <div class="panel-muted flex items-center gap-3 p-4">
      <img alt="EAGLEBET" class="h-12 w-12 rounded-2xl object-cover" src="/eaglebet-logo.png" />
      <div>
        <p class="text-lg font-extrabold">EAGLEBET</p>
        <p class="muted-text text-xs">النظام المحاسبي الداخلي</p>
      </div>
    </div>

    <nav class="space-y-2" aria-label="القائمة الرئيسية">
      <template v-for="item in navigationItems" :key="item.label">
        <div v-if="'to' in item" class="space-y-2">
          <RouterLink
            class="flex items-center justify-between rounded-2xl px-4 py-3 transition"
            :class="isActive(item) ? 'bg-amber-400/14 text-[#f1deb0]' : 'text-white/75 hover:bg-white/5 hover:text-white'"
            :to="item.to"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="h-5 w-5" />
              <span class="font-semibold">{{ item.label }}</span>
            </div>
          </RouterLink>

          <div v-if="'children' in item && item.children?.length" class="space-y-1 pr-4">
            <RouterLink
              v-for="child in item.children"
              :key="child.to"
              class="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition"
              :class="route.path === child.to ? 'bg-white/8 text-[#f3e1b6]' : 'text-white/65 hover:bg-white/5 hover:text-white'"
              :to="child.to"
            >
              <component :is="child.icon" class="h-4 w-4" />
              <span class="font-medium">{{ child.label }}</span>
            </RouterLink>
          </div>
        </div>

        <button
          v-else
          class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/75 transition hover:bg-red-500/10 hover:text-red-300"
          type="button"
          @click="$emit('logout')"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span class="font-semibold">{{ item.label }}</span>
        </button>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { navigationItems } from '@/constants/navigation'

defineEmits<{
  (event: 'logout'): void
}>()

const route = useRoute()

const isActive = (item: (typeof navigationItems)[number]) =>
  'to' in item &&
  (route.path === item.to ||
    ('children' in item && item.children?.some((child) => route.path === child.to)))
</script>
