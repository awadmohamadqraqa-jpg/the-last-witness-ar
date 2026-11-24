import { createContext, useContext, type ReactNode } from 'react'
import { useGame } from '@/hooks/useGame'
import type { GameApi } from '@/hooks/useGame'

const Context = createContext<GameApi | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGame()
  return <Context.Provider value={game}>{children}</Context.Provider>
}

export function useGameContext(): GameApi {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useGameContext must be used inside <GameProvider>')
  return ctx
}
