<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="item in 4" :key="item" height="7rem" borderRadius="24px" />
    </div>
    <Skeleton height="20rem" borderRadius="24px" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>
