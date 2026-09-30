// ── USERS ──
// Add real users here. Passwords are plaintext for this demo.
// For production, hash with argon2 server-side.
export const USERS = [
  { codename: 'SYSADMIN',         pass: 'SYSADMINLOGIN_NSA', role: 'admin',    clearance: 'TS/SCI + ECI', id: 'NSA-SYS',  status: 'active' },
  { codename: 'NETWORKRECON-CYBER', pass: 'CHANGE_ME_NOW',   role: 'analyst',  clearance: 'TS/SCI',       id: 'NSA-0001', status: 'active', rank: 'Intelligence Analyst', dept: 'Cybersecurity Directorate' },
]

// ── ROLE RANKS ──
export const ROLE_RANK = { liaison: 0, analyst: 1, director: 2, admin: 3 }

// ── PERMISSIONS ──
export const PERMS = {
  cybercon:   'director',
  acctCreate: 'admin',
  acctEdit:   'director',
  fileDelete: 'analyst',
  chatSend:   'liaison',
  vaultView:  'analyst',
  staffView:  'analyst',
  acctView:   'analyst',
}

export function hasPermission(user, perm) {
  if (!user) return false
  const required = ROLE_RANK[PERMS[perm]] ?? 99
  const userRank = ROLE_RANK[user.role] ?? -1
  return userRank >= required
}

export const ROLE_LABELS = {
  liaison:  { label: 'LIAISON',  color: 'text-slate-400 bg-slate-800 border-slate-600' },
  analyst:  { label: 'ANALYST',  color: 'text-blue-400 bg-blue-950 border-blue-700'   },
  director: { label: 'DIRECTOR', color: 'text-amber-400 bg-amber-950 border-amber-700'},
  admin:    { label: 'SYSADMIN', color: 'text-red-400 bg-red-950 border-red-700'      },
}

// Access codes for restricted panes
export const ACCESS_CODES = {
  tao:       'TAO-CLEARANCE-7',
  analytics: 'SIGINT-ACCESS-9',
  scs:       'SCS-CLEARANCE-3',
}

// Go routes
export const GO_ROUTES = {
  overview:  { pane: 'overview',   label: 'NSANET://overview',   restricted: false },
  staff:     { pane: 'staff',      label: 'NSANET://staff',      restricted: false },
  comms:     { pane: 'chat',       label: 'NSANET://comms',      restricted: false },
  vault:     { pane: 'files',      label: 'NSANET://vault',      restricted: false },
  accounts:  { pane: 'accounts',   label: 'NSANET://accounts',   restricted: false },
  tao:       { pane: 'tao',        label: 'NSANET://tao',        restricted: true  },
  sigint:    { pane: 'analytics',  label: 'NSANET://sigint',     restricted: true  },
  scs:       { pane: 'scs',        label: 'NSANET://scs',        restricted: true  },
}

export const CLASS_LINE = 'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN'

export const CYBERCON_LEVELS = {
  1: { color: '#EF4444', glow: 'rgba(239,68,68,0.4)',    label: 'CYBERCON 1', desc: 'CRITICAL — ACTIVE INTRUSION OR ATTACK IN PROGRESS',    textColor: '#EF4444' },
  2: { color: '#F59E0B', glow: 'rgba(245,158,11,0.4)',   label: 'CYBERCON 2', desc: 'ELEVATED — CREDIBLE THREAT INTELLIGENCE RECEIVED',      textColor: '#F59E0B' },
  3: { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',  label: 'CYBERCON 3', desc: 'GUARDED — HEIGHTENED SURVEILLANCE POSTURE ACTIVE',      textColor: '#F59E0B' },
  4: { color: '#22C55E', glow: 'rgba(34,197,94,0.35)',   label: 'CYBERCON 4', desc: 'LOW — ROUTINE SIGINT COLLECTION OPERATIONS NOMINAL',    textColor: '#22C55E' },
  5: { color: '#3F6FE8', glow: 'rgba(63,111,232,0.4)',   label: 'CYBERCON 5', desc: 'SECURE — ALL NETWORKS CLEAR // NO KNOWN THREATS',       textColor: '#3F6FE8' },
}
