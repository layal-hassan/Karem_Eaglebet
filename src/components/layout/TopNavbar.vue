<template>
  <header class="panel no-print flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-3">
      <button
        aria-label="فتح القائمة"
        class="ghost-button inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
        type="button"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <div>
        <p class="text-lg font-bold">{{ title }}</p>
        <p class="muted-text text-sm">{{ currentDate }}</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        aria-label="الإشعارات"
        class="ghost-button relative inline-flex h-11 w-11 items-center justify-center rounded-2xl"
        type="button"
      >
        <Bell class="h-5 w-5" />
        <span
          v-if="notificationsCount"
          class="absolute -left-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-black"
        >
          {{ notificationsCount }}
        </span>
      </button>

      <div v-if="user" class="panel-muted flex items-center gap-3 p-2 pr-4">
        <Avatar :image="user.avatar" shape="circle" size="large" />
        <div>
          <p class="text-sm font-bold">{{ user.name }}</p>
          <p class="muted-text text-xs">{{ user.role }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell, Menu } from 'lucide-vue-next'
import Avatar from 'primevue/avatar'
import { computed } from 'vue'
import type { UserProfile } from '@/types'

defineEmits<{
  (event: 'toggle-sidebar'): void
}>()

defineProps<{
  title: string
  user: UserProfile | null
  notificationsCount: number
}>()

const currentDate = computed(() =>
  new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'full',
  }).format(new Date('2026-07-14T12:00:00')),
)
</script>
