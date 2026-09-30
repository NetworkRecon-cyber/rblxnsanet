import type { User } from './auth'

export const API_BASE = 'https://nsanetbackend-production.up.railway.app'

const TOKEN_KEY   = 'nsanet_token'
const SESSION_KEY = 'nsanet_sid'

export function getToken(): string | null  { return sessionStorage.getItem(TOKEN_KEY) }
export function getSid():   string | null  { return sessionStorage.getItem(SESSION_KEY) }
export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem('nsanet_user')
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type':    'application/json',
    'x-session-token': getToken() || '',
  }
}

// ── Auth ──
export interface LoginResponse {
  token: string
  sessionId: string
  user: User
}

export async function apiLogin(codename: string, pass: string, sessionId: string): Promise<LoginResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ codename, pass, sessionId, ip: 'client' }),
      signal:  controller.signal,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    sessionStorage.setItem(TOKEN_KEY,   data.token)
    sessionStorage.setItem(SESSION_KEY, data.sessionId)
    sessionStorage.setItem('nsanet_user', JSON.stringify(data.user))
    return data as LoginResponse
  } finally {
    clearTimeout(timeout)
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST', headers: authHeaders() })
  } catch {}
  clearAuth()
}

export async function apiRestoreSession(): Promise<LoginResponse | null> {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/api/session`, { headers: authHeaders() })
  if (!res.ok) { clearAuth(); return null }
  const data = await res.json()
  sessionStorage.setItem('nsanet_user', JSON.stringify(data.user))
  return data as LoginResponse
}

export async function apiHeartbeat(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/heartbeat`, {
    method: 'POST', headers: authHeaders(),
  })
  return res.ok
}

// ── Users ──
export async function apiGetUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function apiCreateUser(data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to create user')
  return body
}

export async function apiEditUser(codename: string, data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(codename)}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to update user')
  return body
}

// ── Log ──
export async function apiGetLog(limit = 100): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/api/log?limit=${limit}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch log')
  return res.json()
}

export async function apiGetSessions(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/api/sessions`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function apiKillSession(token: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(token)}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to kill session')
  return res.json()
}

// ── Pane data ──
export async function apiGetPane(pane: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/api/${pane}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch ${pane}`)
  return res.json()
}

export async function apiSavePane(pane: string, data: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/${pane}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to save ${pane}`)
  return res.json()
}

// ── Comms ──
export async function apiGetComms(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/comms`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch comms')
  return res.json()
}

export async function apiSaveComms(data: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/comms`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save comms')
  return res.json()
}

export async function apiSendMessage(channel: string, text: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/comms/message`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ channel, text }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

// ── Vault ──
export interface VaultFile {
  id: string
  name: string
  classification: string
  size?: string
  date?: string
  uploader?: string
  content?: string
}

export async function apiGetVault(): Promise<VaultFile[]> {
  const res = await fetch(`${API_BASE}/api/vault`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch vault')
  return res.json()
}

export async function apiAddVaultFile(file: Partial<VaultFile>): Promise<VaultFile> {
  const res = await fetch(`${API_BASE}/api/vault`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(file),
  })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}

export async function apiDeleteVaultFile(id: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/vault/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete file')
  return res.json()
}
