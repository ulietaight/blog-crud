import { create } from 'zustand'

export type User = {
  id: number
  username: string
  role: 'admin' | 'survivor' | 'nikita'
}

interface State {
  user?: User
  setUser: (user?: User) => void
}

export const useAuth = create<State>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}))
