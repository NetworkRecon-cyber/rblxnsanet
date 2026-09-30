import { supabase } from './supabase'
import { USERS } from './auth'
import type { User } from './auth'

declare global {
  interface Window {
    electronAPI?: {
      loadUsers: () => Promise<User[] | null>
    }
  }
}

/** Load users: Supabase → Electron IPC → hardcoded fallback */
export async function loadUsers(): Promise<User[]> {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    if (!error && data && data.length > 0) {
      return data as User[]
    }
  } catch {}

  // 2. Try Electron IPC (users.json next to exe)
  if (window.electronAPI?.loadUsers) {
    try {
      const fromFile = await window.electronAPI.loadUsers()
      if (fromFile && Array.isArray(fromFile) && fromFile.length > 0) {
        return fromFile
      }
    } catch {}
  }

  // 3. Hardcoded fallback
  return USERS
}

/** Authenticate a codename/pass against Supabase → local fallback */
export async function authenticateUser(
  codename: string,
  pass: string
): Promise<User | null> {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('codename', codename.trim())
      .eq('pass', pass.trim())
      .single()
    if (!error && data) return data as User
  } catch {}

  // 2. Local fallback
  const all = await loadUsers()
  return all.find(
    u =>
      u.codename.toUpperCase() === codename.trim().toUpperCase() &&
      u.pass === pass.trim()
  ) ?? null
}
