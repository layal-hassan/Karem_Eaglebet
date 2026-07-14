<template>
  <div class="min-h-screen overflow-x-clip">
    <div class="mx-auto flex max-w-[1800px] gap-6 overflow-x-clip px-4 py-4 md:px-6">
      <aside class="panel no-print sticky top-4 hidden h-[calc(100vh-2rem)] w-[320px] overflow-hidden lg:block">
        <Sidebar @logout="handleLogout" />
      </aside>

      <Drawer
        class="lg:!hidden"
        position="right"
        :visible="sidebarOpen"
        @update:visible="sidebarOpen = $event"
      >
        <Sidebar @logout="handleLogout" />
      </Drawer>

      <main class="min-w-0 flex-1 space-y-6 overflow-x-clip">
        <TopNavbar
          :notifications-count="store.notifications.filter((item) => item.unread).length"
          :title="currentTitle"
          :user="store.currentUser"
          @toggle-sidebar="sidebarOpen = true"
        />
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Drawer from 'primevue/drawer'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopNavbar from '@/components/layout/TopNavbar.vue'
import { useAccountingStore } from '@/stores/accounting'

const store = useAccountingStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const currentTitle = computed(() => String(route.meta.title ?? 'EAGLEBET'))

const handleLogout = async () => {
  await store.logout()
  await router.push('/login')
}

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)

onMounted(async () => {
  await store.initialize()
})
</script>
