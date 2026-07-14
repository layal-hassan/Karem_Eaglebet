<template>
  <router-view />
  <Toast position="top-left" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
</script>
