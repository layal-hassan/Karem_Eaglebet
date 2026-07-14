import { delay } from './base'
import { mockSessionUser } from '@/mocks/database'

const AUTH_KEY = 'eaglebet-auth'

export const authService = {
  async login(username: string, password: string) {
    await delay()

    if (!username || !password) {
      throw new Error('بيانات الدخول غير مكتملة')
    }

    window.localStorage.setItem(AUTH_KEY, 'true')
    return {
      ...mockSessionUser,
      name: 'karem boss',
    }
  },

  async logout() {
    await delay(100)
    window.localStorage.removeItem(AUTH_KEY)
  },

  isAuthenticated() {
    return window.localStorage.getItem(AUTH_KEY) === 'true'
  },
}
