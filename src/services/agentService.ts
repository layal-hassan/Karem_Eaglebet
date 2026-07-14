import { clone, delay } from './base'
import { seedAgents } from '@/mocks/database'
import type { AgentRecord } from '@/types'

const dbAgents = [...seedAgents]

export const agentService = {
  async list() {
    await delay()
    return clone(dbAgents)
  },

  async getById(id: string) {
    await delay(150)
    return clone(dbAgents.find((agent) => agent.id === id) ?? null)
  },

  async create(payload: AgentRecord) {
    await delay()
    const record: AgentRecord = { ...payload }
    dbAgents.unshift(record)
    return clone(record)
  },

  async update(id: string, payload: AgentRecord) {
    await delay()
    const record: AgentRecord = { ...payload }
    const index = dbAgents.findIndex((agent) => agent.id === id)
    if (index >= 0) dbAgents[index] = record
    return clone(record)
  },
}
