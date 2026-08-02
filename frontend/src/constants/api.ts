export const API_ENDPOINTS = {
  auth: {
    signIn: '/api/auth/sign-in/',
    refreshToken: '/api/auth/refresh/',
    currentUser: '/api/auth/me/',
    logout: '/api/auth/logout/',
  },
  accounting: {
    agents: '/api/agents/',
    transactions: '/api/transactions/',
  },
  wallets: {
    getAgentAllWallets: '/global/api/UserApi/getAgentAllWallets',
    depositToAgent: '/global/api/UserApi/depositToAgent',
    withdrawFromAgent: '/global/api/UserApi/withdrawFromAgent',
  },
  agents: {
    getChildren: '/global/api/UserApi/getChildren',
  },
  players: {
    registerPlayer: '/global/api/UserApi/registerPlayer',
    getPlayersForCurrentAgent: '/global/api/UserApi/getPlayersForCurrentAgent',
    depositToPlayer: '/global/api/UserApi/depositToPlayer',
    withdrawFromPlayer: '/global/api/UserApi/withdrawFromPlayer',
    getPlayerBalanceById: '/global/api/UserApi/getPlayerBalanceById',
  },
} as const
