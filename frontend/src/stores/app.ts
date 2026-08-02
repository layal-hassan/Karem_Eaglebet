import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface AppToast {
  id: number
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail: string
  life?: number
}

export const useAppStore = defineStore('app', () => {
  const pendingRequests = ref(0)
  const toastQueue = ref<AppToast[]>([])
  const lastToastId = ref(0)

  const isBusy = computed(() => pendingRequests.value > 0)

  const beginRequest = () => {
    pendingRequests.value += 1
  }

  const endRequest = () => {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  const enqueueToast = (toast: Omit<AppToast, 'id'>) => {
    lastToastId.value += 1
    toastQueue.value.push({
      id: lastToastId.value,
      ...toast,
    })
  }

  const consumeToasts = () => {
    const items = [...toastQueue.value]
    toastQueue.value = []
    return items
  }

  return {
    pendingRequests,
    toastQueue,
    isBusy,
    beginRequest,
    endRequest,
    enqueueToast,
    consumeToasts,
  }
})
