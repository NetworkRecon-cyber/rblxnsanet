// ── NSANET API Layer v2 ──
// Set this to your backend machine's IP and port.
// When running locally: http://192.168.1.86:4000
// Change this to your actual IP if it differs.
export const API_BASE = 'https://nsanetbackend-production.up.railway.app'

const TOKEN_KEY   = 'nsanet_token'
const SESSION_KEY = 'nsanet_sid'

export function getToken()  { return sessionStorage.getItem(TOKEN_KEY) }
export function getSid()    { return sessionStorage.getItem(SESSION_KEY) }
export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem('nsanet_user')
}

function authHeaders() {
  return {
    'Content-Type':     'application/json',
    'x-session-token':  getToken() || '',
  }
}

// ── Auth ──
export async function apiLogin(codename, pass, sessionId) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ codename, pass, sessionId, ip: 'client' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  // Store token and session
  sessionStorage.setItem(TOKEN_KEY, data.token)
  sessionStorage.setItem(SESSION_KEY, data.sessionId)
  sessionStorage.setItem('nsanet_user', JSON.stringify(data.user))
  return data
}

export async function apiLogout() {
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method:  'POST',
      headers: authHeaders(),
    })
  } catch {}
  clearAuth()
}

export async function apiRestoreSession() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/api/session`, { headers: authHeaders() })
  if (!res.ok) { clearAuth(); return null }
  const data = await res.json()
  sessionStorage.setItem('nsanet_user', JSON.stringify(data.user))
  return data
}

export async function apiHeartbeat() {
  const res = await fetch(`${API_BASE}/api/heartbeat`, {
    method:  'POST',
    headers: authHeaders(),
  })
  if (!res.ok) return false
  return true
}

// ── Users ──
export async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function apiCreateUser(data) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to create user')
  return body
}

export async function apiEditUser(codename, data) {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(codename)}`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to update user')
  return body
}

// ── Log ──
export async function apiGetLog(limit = 100) {
  const res = await fetch(`${API_BASE}/api/log?limit=${limit}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch log')
  return res.json()
}

export async function apiGetSessions() {
  const res = await fetch(`${API_BASE}/api/sessions`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function apiKillSession(token) {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(token)}`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to kill session')
  return res.json()
}

// ═══════════════════════════════
// PANE DATA
// ═══════════════════════════════

export async function apiGetPane(pane) {
  const res = await fetch(`${API_BASE}/api/${pane}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch ${pane}`)
  return res.json()
}

export async function apiSavePane(pane, data) {
  const res = await fetch(`${API_BASE}/api/${pane}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Failed to save ${pane}`)
  return res.json()
}

// ═══════════════════════════════
// COMMS
// ═══════════════════════════════

export async function apiGetComms() {
  const res = await fetch(`${API_BASE}/api/comms`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch comms')
  return res.json()
}

export async function apiSaveComms(data) {
  const res = await fetch(`${API_BASE}/api/comms`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to save comms')
  return res.json()
}

export async function apiSendMessage(channel, text) {
  const res = await fetch(`${API_BASE}/api/comms/message`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ channel, text })
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

// ═══════════════════════════════
// VAULT
// ═══════════════════════════════

export async function apiGetVault() {
  const res = await fetch(`${API_BASE}/api/vault`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch vault')
  return res.json()
}

export async function apiAddVaultFile(file) {
  const res = await fetch(`${API_BASE}/api/vault`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(file)
  })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}

export async function apiDeleteVaultFile(id) {
  const res = await fetch(`${API_BASE}/api/vault/${id}`, {
    method: 'DELETE', headers: authHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete file')
  return res.json()
}
