import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useSettingsStore } from '@/hooks/useSettingsStore'
import type { SettingsStore } from '@/hooks/useSettingsStore'

const Context = createContext<SettingsStore | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const store = useSettingsStore()
  const value = useMemo(() => store, [store])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSettingsContext(): SettingsStore {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useSettingsContext must be used inside <SettingsProvider>')
  return ctx
}
