import { clone, delay } from './base'
import { mockSessionUser, notificationsSeed } from '@/mocks/database'

export const systemService = {
  async currentUser() {
    await delay(100)
    return {
      ...clone(mockSessionUser),
      name: 'karem boss',
    }
  },

  async notifications() {
    await delay(100)
    return clone(notificationsSeed)
  },
}
