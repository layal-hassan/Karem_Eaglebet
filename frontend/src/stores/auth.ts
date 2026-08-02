import { computed } from 'vue'
import { useSessionStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { AuthSession, AuthTokenPair } from '@/models/api'

const AUTH_SESSION_KEY = 'eaglebet-auth-session'

export const useAuthStore = defineStore('auth', () => {
  const session = useSessionStorage<AuthSession | null>(AUTH_SESSION_KEY, null)

  const isAuthenticated = computed(() => Boolean(session.value?.accessToken && session.value?.refreshToken))
  const accessToken = computed(() => session.value?.accessToken ?? null)
  const refreshToken = computed(() => session.value?.refreshToken ?? null)
  const username = computed(() => session.value?.username ?? null)

  const setSession = (tokens: AuthTokenPair, usernameValue?: string | null) => {
    session.value = {
      ...tokens,
      username: usernameValue ?? session.value?.username ?? undefined,
      issuedAt: new Date().toISOString(),
    }
  }

  const clearSession = () => {
    session.value = null
  }

  return {
    session,
    isAuthenticated,
    accessToken,
    refreshToken,
    username,
    setSession,
    clearSession,
  }
})
