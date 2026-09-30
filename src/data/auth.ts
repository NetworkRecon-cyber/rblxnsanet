// ── Types ──
export interface User {
  codename: string
  pass: string
  role: 'liaison' | 'analyst' | 'director' | 'admin'
  clearance: string
  id: string
  status: string
  rank?: string
  dept?: string
}

export type Perm =
  | 'cybercon' | 'acctCreate' | 'acctEdit'
  | 'fileDelete' | 'chatSend' | 'vaultView'
  | 'staffView' | 'acctView' | 'antView' | 'awardsView'

export interface GoRoute {
  pane: string
  label: string
  restricted: boolean
  accessCode?: string
}

export interface CyberconLevel {
  color: string
  glow: string
  label: string
  desc: string
  textColor: string
}

// ── USERS ──
export const USERS: User[] = [
  { codename: 'SYSADMIN',           pass: 'SYSADMINLOGIN_NSA', role: 'admin',    clearance: 'TS/SCI + ECI', id: 'NSA-SYS',  status: 'active' },
  { codename: 'NETWORKRECON-CYBER', pass: 'CHANGE_ME_NOW',     role: 'analyst',  clearance: 'TS/SCI',       id: 'NSA-0001', status: 'active', rank: 'Intelligence Analyst', dept: 'Cybersecurity Directorate' },
]

// ── ROLE RANKS ──
export const ROLE_RANK: Record<string, number> = {
  liaison: 0, analyst: 1, director: 2, admin: 3,
}

// ── PERMISSIONS ──
export const PERMS: Record<Perm, string> = {
  cybercon:   'director',
  acctCreate: 'admin',
  acctEdit:   'director',
  fileDelete: 'analyst',
  chatSend:   'liaison',
  vaultView:  'analyst',
  staffView:  'analyst',
  acctView:   'analyst',
  antView:    'analyst',
  awardsView: 'liaison',
}

export function hasPermission(user: User | null, perm: Perm): boolean {
  if (!user) return false
  const required  = ROLE_RANK[PERMS[perm]] ?? 99
  const userRank  = ROLE_RANK[user.role]   ?? -1
  return userRank >= required
}

export const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  liaison:  { label: 'LIAISON',  color: 'text-slate-400 bg-slate-800 border-slate-600' },
  analyst:  { label: 'ANALYST',  color: 'text-blue-400 bg-blue-950 border-blue-700'   },
  director: { label: 'DIRECTOR', color: 'text-amber-400 bg-amber-950 border-amber-700'},
  admin:    { label: 'SYSADMIN', color: 'text-red-400 bg-red-950 border-red-700'      },
}

// ── Access codes for restricted panes ──
export const ACCESS_CODES: Record<string, string> = {
  tao:       'BYZANTINE RAPTOR',
  ant:       'BYZANTINE RAPTOR',
  analytics: 'OAKSTAR PRISM',
  scs:       'TURBINE ECHO',
}

// ── Go routes ──
export const GO_ROUTES: Record<string, GoRoute> = {
  overview:  { pane: 'overview',   label: 'NSANET://overview',   restricted: false },
  staff:     { pane: 'staff',      label: 'NSANET://staff',      restricted: false },
  comms:     { pane: 'chat',       label: 'NSANET://comms',      restricted: false },
  vault:     { pane: 'files',      label: 'NSANET://vault',      restricted: false },
  accounts:  { pane: 'accounts',   label: 'NSANET://accounts',   restricted: false },
  ant:       { pane: 'ant',        label: 'NSANET://ant',        restricted: false },
  awards:    { pane: 'awards',     label: 'NSANET://awards',     restricted: false },
  tao:       { pane: 'tao',        label: 'NSANET://tao',        restricted: true  },
  ant:       { pane: 'ant',        label: 'NSANET://ant',        restricted: true  },
  sso:       { pane: 'analytics',  label: 'NSANET://sso',        restricted: true  },
  scs:       { pane: 'scs',        label: 'NSANET://scs',        restricted: true  },
}

export const CLASS_LINE = 'TOP SECRET//COMINT-G//NOFORN/ORCON'

export const CYBERCON_LEVELS: Record<number, CyberconLevel> = {
  1: { color: '#EF4444', glow: 'rgba(239,68,68,0.4)',    label: 'CYBERCON 1', desc: 'CRITICAL — ACTIVE INTRUSION OR ATTACK IN PROGRESS',   textColor: '#EF4444' },
  2: { color: '#F59E0B', glow: 'rgba(245,158,11,0.4)',   label: 'CYBERCON 2', desc: 'ELEVATED — CREDIBLE THREAT INTELLIGENCE RECEIVED',     textColor: '#F59E0B' },
  3: { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',  label: 'CYBERCON 3', desc: 'GUARDED — HEIGHTENED SURVEILLANCE POSTURE ACTIVE',     textColor: '#F59E0B' },
  4: { color: '#22C55E', glow: 'rgba(34,197,94,0.35)',   label: 'CYBERCON 4', desc: 'LOW — ROUTINE SIGINT COLLECTION OPERATIONS NOMINAL',   textColor: '#22C55E' },
  5: { color: '#3F6FE8', glow: 'rgba(63,111,232,0.4)',   label: 'CYBERCON 5', desc: 'SECURE — ALL NETWORKS CLEAR // NO KNOWN THREATS',      textColor: '#3F6FE8' },
}
