<template>
  <transition name="loading-bar">
    <div v-if="appStore.isBusy" class="pointer-events-none fixed inset-x-0 top-0 z-[2000] h-1 overflow-hidden">
      <div class="loading-bar-track h-full w-full bg-amber-400"></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.loading-bar-track {
  transform-origin: left center;
  animation: request-bar 1.2s ease-in-out infinite;
}

.loading-bar-enter-active,
.loading-bar-leave-active {
  transition: opacity 0.2s ease;
}

.loading-bar-enter-from,
.loading-bar-leave-to {
  opacity: 0;
}

@keyframes request-bar {
  0% {
    transform: scaleX(0.1);
  }

  50% {
    transform: scaleX(0.65);
  }

  100% {
    transform: scaleX(1);
  }
}
</style>
