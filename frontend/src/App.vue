<template>
  <GlobalRequestOverlay />
  <router-view />
  <Toast position="top-left" />
  <ConfirmDialog />
  <ToastBridge />
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import GlobalRequestOverlay from '@/components/common/GlobalRequestOverlay.vue'
import ToastBridge from '@/components/common/ToastBridge.vue'
</script>
