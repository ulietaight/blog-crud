import type { User } from './store'

export interface RoundInfo {
  id: string
  start: string
  end: string
  status: 'active' | 'cooldown' | 'finished'
}

export interface RoundDetails extends RoundInfo {
  total: number
  myPoints: number
  winner?: { username: string; points: number }
}

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }
  return res.json()
}

export async function getRounds(): Promise<RoundInfo[]> {
  const res = await fetch('/rounds', { credentials: 'include' })
  if (!res.ok) throw new Error('failed')
  return res.json()
}

export async function createRound() {
  const res = await fetch('/rounds', { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error('failed')
  return res.json()
}

export async function getRound(id: string): Promise<RoundDetails> {
  const res = await fetch(`/rounds/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('failed')
  return res.json()
}

export async function tap(id: string) {
  const res = await fetch(`/rounds/${id}/tap`, { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error('failed')
  return res.json()
}
