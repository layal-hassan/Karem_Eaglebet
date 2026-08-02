import type {
  AgentChildRecord,
  AgentWallet,
  AgentWalletMutationRequest,
  AgentWalletMutationResult,
  AuthTokenPair,
  GetChildrenRequest,
  PaginatedResult,
  PlayerBalanceRequest,
  PlayerBalanceResult,
  PlayerRecord,
  PlayerWalletMutationRequest,
  PlayerWalletMutationResult,
  RegisterPlayerRequest,
  RegisterPlayerResult,
} from '@/models/api'
import { seedAgents } from '@/mocks/database'

const mockWallets: AgentWallet[] = [
  {
    currencyName: 'US Dollar',
    currencyCode: 'USD',
    availableWallet: 12840.5,
    creditLine: 0,
    credit: 0,
    availability: 12840.5,
    balance: 12840.5,
    bonus: 0,
    frozenBalance: 0,
    withdrawAmount: 12840.5,
  },
  {
    currencyName: 'Syrian Pound',
    currencyCode: 'SYP',
    availableWallet: 34500000,
    creditLine: 0,
    credit: 0,
    availability: 34500000,
    balance: 34500000,
    bonus: 0,
    frozenBalance: 0,
    withdrawAmount: 34500000,
  },
]

const mockPlayers: PlayerRecord[] = [
  {
    playerId: '15107888',
    affiliateId: 'agent-1',
    username: 'player.one',
    registerDate: '2026-07-10T11:00:00.000Z',
    currency: 'AED',
    firstName: null,
    lastName: null,
    phoneNumber: null,
  },
  {
    playerId: '15113649',
    affiliateId: 'agent-2',
    username: 'player.two',
    registerDate: '2026-07-11T09:30:00.000Z',
    currency: 'EUR',
    firstName: null,
    lastName: null,
    phoneNumber: null,
  },
]

const MANUAL_USERNAME = 'Brando.e99'
const MANUAL_PASSWORD = 'Bba@1234'

const createMockTokenPair = (): AuthTokenPair => ({
  accessToken: `mock-access-${crypto.randomUUID()}`,
  refreshToken: `mock-refresh-${crypto.randomUUID()}`,
})

const childRecords: AgentChildRecord[] = seedAgents.map((agent) => ({
  affiliateId: agent.id,
  username: agent.username ?? agent.code.toLowerCase(),
  email: agent.username ? `${agent.username}@example.test` : null,
  status: agent.status,
  firstName: agent.name,
  lastName: null,
  phoneNumber: agent.phone,
}))

export const mockAgentApi = {
  signIn(username: string, password: string) {
    if (username !== MANUAL_USERNAME || password !== MANUAL_PASSWORD) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
    }

    return createMockTokenPair()
  },

  refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required')
    }

    return createMockTokenPair()
  },

  getAgentAllWallets() {
    return structuredClone(mockWallets)
  },

  depositToAgent(payload: AgentWalletMutationRequest): AgentWalletMutationResult {
    return {
      balance: payload.amount,
      creditLine: 0,
      credit: 0,
      availability: payload.amount,
      currencyCode: payload.currencyCode,
    }
  },

  withdrawFromAgent(payload: AgentWalletMutationRequest): AgentWalletMutationResult {
    return {
      balance: Math.max(0, 10000 - payload.amount),
      creditLine: 0,
      credit: 0,
      availability: Math.max(0, 10000 - payload.amount),
      currencyCode: payload.currencyCode,
    }
  },

  getChildren(payload?: GetChildrenRequest): PaginatedResult<AgentChildRecord> {
    void payload
    return {
      records: structuredClone(childRecords),
      totalRecordsCount: childRecords.length,
      total: childRecords.length,
    }
  },

  registerPlayer(payload: RegisterPlayerRequest): RegisterPlayerResult {
    return {
      playerId: String(Date.now()),
      username: payload.username,
      parentId: payload.parentId,
    }
  },

  getPlayersForCurrentAgent(): PaginatedResult<PlayerRecord> {
    return {
      records: structuredClone(mockPlayers),
      totalRecordsCount: mockPlayers.length,
      total: mockPlayers.length,
    }
  },

  depositToPlayer(payload: PlayerWalletMutationRequest): PlayerWalletMutationResult {
    return {
      balance: payload.amount,
      credit: 0,
      currencyCode: payload.currencyCode,
    }
  },

  withdrawFromPlayer(payload: PlayerWalletMutationRequest): PlayerWalletMutationResult {
    return {
      balance: Math.max(0, 5000 - payload.amount),
      credit: 0,
      currencyCode: payload.currencyCode,
    }
  },

  getPlayerBalanceById(payload: PlayerBalanceRequest): PlayerBalanceResult {
    const player = mockPlayers.find((item) => item.playerId === payload.playerId)

    return {
      balance: player ? 4900 : 0,
      currencyCode: player?.currency ?? 'AED',
      main: true,
    }
  },
}
