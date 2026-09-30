import React from 'react'
import { AlertOctagon, Target, Zap, BarChart2, Radio, Globe, TrendingUp } from 'lucide-react'
import type { User } from '../data/auth'

// ─── TAO ──────────────────────────────────────────────────────────────────────

interface Operation {
  codename:  string
  status:    'ACTIVE' | 'DORMANT' | 'COMPROMISED'
  target:    string
  type:      string
  initiated: string
  officer:   string
}

const OPERATIONS: Operation[] = [
  { codename: 'BYZANTINE HADES', status: 'ACTIVE',      target: 'APT29 Infrastructure',       type: 'CNE',    initiated: '2024-01-07', officer: 'WRAITH'  },
  { codename: 'QUANTUM INSERT',  status: 'ACTIVE',      target: 'Foreign Telecom Backbone',    type: 'SIGINT', initiated: '2024-02-14', officer: 'SPECTER' },
  { codename: 'TURBINE',         status: 'ACTIVE',      target: 'Mass-scale Implant Network',  type: 'CNE',    initiated: '2023-11-01', officer: 'CIPHER'  },
  { codename: 'FOXACID',         status: 'DORMANT',     target: 'Target Browser Exploitation', type: 'CNA',    initiated: '2024-03-01', officer: 'PHANTOM' },
  { codename: 'NIGHTFALL',       status: 'ACTIVE',      target: 'Diplomatic Comms Intercept',  type: 'SIGINT', initiated: '2024-03-10', officer: 'RAVEN'   },
  { codename: 'DROPOUT JEEP',    status: 'COMPROMISED', target: 'Mobile Device Collection',    type: 'CNE',    initiated: '2023-09-15', officer: 'ORACLE'  },
]

const OP_STATUS_STYLE: Record<string, string> = {
  ACTIVE:      'text-green-400 bg-green-950/50 border-green-800/50',
  DORMANT:     'text-slate-400 bg-slate-900/50 border-slate-700/50',
  COMPROMISED: 'text-red-400   bg-red-950/50   border-red-800/50',
}

const TYPE_STYLE: Record<string, string> = {
  CNE:    'text-amber-400 bg-amber-950/40 border-amber-800/50',
  CNA:    'text-red-400   bg-red-950/40   border-red-800/50',
  SIGINT: 'text-blue-400  bg-blue-950/40  border-blue-800/50',
}

export const TAO: React.FC<{ user: User }> = ({ user }) => (
  <div className="max-w-5xl mx-auto space-y-5">

    {/* Restricted banner */}
    <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 rounded-xl px-5 py-3.5">
      <AlertOctagon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-red-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — TAO ACCESS ONLY</div>
        <div className="text-red-500/60 font-mono text-[10px] mt-0.5">TAILORED ACCESS OPERATIONS CENTER // TS//SI//TK//NOFORN</div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-lg font-semibold text-red-400 tracking-wide">TAO Operations Center</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Operator: <span className="font-mono text-red-400">{user.codename}</span></p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-mono text-red-500">LIVE</span>
      </div>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Active Ops',       value: '4',      icon: Zap,    color: 'text-red-400',   border: 'border-red-500/20',   bg: 'bg-red-500/8'   },
        { label: 'Implants Deployed',value: '14,892', icon: Globe,  color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/8' },
        { label: 'Active Targets',   value: '37',     icon: Target, color: 'text-red-400',   border: 'border-red-500/20',   bg: 'bg-red-500/8'   },
      ].map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
            <Icon size={16} className={`${s.color} mb-3`} />
            <div className={`text-2xl font-bold tracking-tight ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
          </div>
        )
      })}
    </div>

    {/* Operations table */}
    <div className="bg-[#0C0F1A] border border-red-900/30 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-red-900/30 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-red-400">Active Operations</span>
        <span className="text-[10px] font-mono text-slate-600">6 RECORDS</span>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#1E2540] bg-[#080B14]">
            {['Operation', 'Type', 'Target', 'Officer', 'Initiated', 'Status'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1F35]">
          {OPERATIONS.map(op => (
            <tr key={op.codename} className="hover:bg-red-950/10 transition-colors">
              <td className="px-5 py-3.5 font-mono font-semibold text-red-300 tracking-wide text-[11px]">{op.codename}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-block border rounded px-2 py-0.5 text-[9px] font-mono font-bold ${TYPE_STYLE[op.type] ?? 'text-slate-400 border-slate-700'}`}>
                  {op.type}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-400 text-[11px]">{op.target}</td>
              <td className="px-5 py-3.5 font-mono text-slate-300 text-[11px]">{op.officer}</td>
              <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">{op.initiated}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${OP_STATUS_STYLE[op.status]}`}>
                  {op.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// ─── SSO — Special Source Operations ─────────────────────────────────────────

interface Provider {
  codename:    string
  program:     string
  company:     string
  status:      'ACTIVE' | 'DEGRADED' | 'OFFLINE'
  dailyVol:    string
  selectors:   string
  established: string
}

const PROVIDERS: Provider[] = [
  { codename: 'PRISM',      program: 'US-984XN', company: 'Major US Internet Providers', status: 'ACTIVE',   dailyVol: '1.9M',  selectors: '94,871',  established: '2007-09-11' },
  { codename: 'OAKSTAR',    program: 'DS-300',   company: 'Upstream Telecom Partners',   status: 'ACTIVE',   dailyVol: '3.1M',  selectors: '182,440', established: '2004-03-02' },
  { codename: 'STORMBREW',  program: 'DS-200B',  company: 'US Backbone Carriers',        status: 'ACTIVE',   dailyVol: '2.4M',  selectors: '71,203',  established: '2006-01-14' },
  { codename: 'BLARNEY',    program: 'DS-200A',  company: 'AT&T / Peering Points',       status: 'DEGRADED', dailyVol: '0.6M',  selectors: '38,009',  established: '1978-10-25' },
  { codename: 'FAIRVIEW',   program: 'DS-200C',  company: 'AT&T Global Backbone',        status: 'ACTIVE',   dailyVol: '4.7M',  selectors: '214,550', established: '1985-07-09' },
  { codename: 'LITHIUM',    program: 'DS-302',   company: 'Foreign Tier-1 Partner',      status: 'OFFLINE',  dailyVol: '—',     selectors: '—',       established: '2010-05-03' },
]

interface CollectionRecord {
  uid:         string
  ip:          string
  geo:         string
  provider:    string
  fingerprint: string
  accounts:    string[]
  token:       string
  ts:          string
}

const RECORDS: CollectionRecord[] = [
  { uid: 'SSO-0041', ip: '91.108.4.XXX',  geo: 'Moscow, RU',       provider: 'STORMBREW', fingerprint: 'Chrome/Win10/x64',   accounts: ['Telegram', 'VK', 'ProtonMail'], token: 'eyJ...7fQx', ts: '2024-03-14 02:17:43Z' },
  { uid: 'SSO-0042', ip: '185.220.101.XX',geo: 'Frankfurt, DE',     provider: 'OAKSTAR',   fingerprint: 'Firefox/Linux/x64',  accounts: ['Signal', 'ProtonMail'],         token: 'eyJ...kR9m', ts: '2024-03-14 03:44:11Z' },
  { uid: 'SSO-0043', ip: '5.188.62.XXX',  geo: 'Beijing, CN',       provider: 'FAIRVIEW',  fingerprint: 'Chrome/Win11/x64',   accounts: ['WeChat', 'Weibo', 'QQ'],        token: 'eyJ...pL2w', ts: '2024-03-14 06:02:58Z' },
  { uid: 'SSO-0044', ip: '37.19.221.XX',  geo: 'Tehran, IR',        provider: 'BLARNEY',   fingerprint: 'Tor Browser/Win10',  accounts: ['Telegram'],                     token: 'eyJ...nX4c', ts: '2024-03-14 07:31:22Z' },
  { uid: 'SSO-0045', ip: '194.165.16.XX', geo: 'Pyongyang, KP',     provider: 'STORMBREW', fingerprint: 'IE11/WinXP/x86',    accounts: ['—'],                            token: 'eyJ...mQ8s', ts: '2024-03-14 09:15:04Z' },
  { uid: 'SSO-0046', ip: '46.183.220.XX', geo: 'Minsk, BY',         provider: 'OAKSTAR',   fingerprint: 'Chrome/Android/ARM', accounts: ['Telegram', 'VK'],               token: 'eyJ...rT6p', ts: '2024-03-14 11:49:37Z' },
]

const PROVIDER_STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'text-green-400 bg-green-950/50 border-green-800/50',
  DEGRADED: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
  OFFLINE:  'text-slate-500 bg-slate-900/50 border-slate-700/50',
}

export const Analytics: React.FC<{ user: User }> = ({ user }) => (
  <div className="max-w-6xl mx-auto space-y-5">

    {/* Restricted banner */}
    <div className="flex items-start gap-3 bg-violet-950/30 border border-violet-900/50 rounded-xl px-5 py-3.5">
      <AlertOctagon size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-violet-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — SSO ACCESS ONLY</div>
        <div className="text-violet-500/60 font-mono text-[10px] mt-0.5">SPECIAL SOURCE OPERATIONS // TS//SI//ORCON/NOFORN — OAKSTAR/PRISM COMPARTMENT</div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-lg font-semibold text-violet-400 tracking-wide">Special Source Operations</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Upstream collection dashboard — Operator: <span className="font-mono text-violet-400">{user.codename}</span></p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-[10px] font-mono text-violet-500">LIVE FEED</span>
      </div>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Daily Intercepts',     value: '12.7M', icon: Radio,        color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/8' },
        { label: 'Active Providers',     value: '4 / 6', icon: Globe,        color: 'text-green-400',  border: 'border-green-500/20',  bg: 'bg-green-500/8'  },
        { label: 'Selectors On-Target',  value: '601K',  icon: TrendingUp,   color: 'text-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/8'   },
        { label: 'Flagged for Analysis', value: '8,442', icon: AlertOctagon, color: 'text-amber-400',  border: 'border-amber-500/20',  bg: 'bg-amber-500/8'  },
      ].map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
            <Icon size={16} className={`${s.color} mb-3`} />
            <div className={`text-2xl font-bold tracking-tight ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
          </div>
        )
      })}
    </div>

    {/* Provider status table */}
    <div className="bg-[#0C0F1A] border border-violet-900/30 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-violet-900/30 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-violet-400">Upstream Provider Status</span>
        <span className="text-[10px] font-mono text-slate-600">6 PROGRAMS</span>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#1E2540] bg-[#080B14]">
            {['Codename', 'Program', 'Source', 'Daily Vol', 'Selectors', 'Online Since', 'Status'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1F35]">
          {PROVIDERS.map(p => (
            <tr key={p.codename} className="hover:bg-violet-950/10 transition-colors">
              <td className="px-4 py-3 font-mono font-bold text-violet-300 tracking-widest text-[11px]">{p.codename}</td>
              <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{p.program}</td>
              <td className="px-4 py-3 text-slate-400 text-[11px]">{p.company}</td>
              <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">{p.dailyVol}</td>
              <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{p.selectors}</td>
              <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{p.established}</td>
              <td className="px-4 py-3">
                <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${PROVIDER_STATUS_STYLE[p.status]}`}>
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Collection records */}
    <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-300">Recent Collection Records</span>
        <span className="text-[10px] font-mono text-slate-600">LAST 6 EVENTS</span>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#1E2540] bg-[#080B14]">
            {['UID', 'IP', 'Geo', 'Provider', 'Fingerprint', 'Connected Accounts', 'Token', 'Timestamp'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1F35]">
          {RECORDS.map(r => (
            <tr key={r.uid} className="hover:bg-[#111627] transition-colors">
              <td className="px-4 py-3 font-mono text-violet-400 text-[10px]">{r.uid}</td>
              <td className="px-4 py-3 font-mono text-slate-300 text-[10px]">{r.ip}</td>
              <td className="px-4 py-3 text-slate-400 text-[11px]">{r.geo}</td>
              <td className="px-4 py-3 font-mono text-[10px]">
                <span className="text-violet-300 bg-violet-950/40 border border-violet-800/40 rounded px-1.5 py-0.5">{r.provider}</span>
              </td>
              <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{r.fingerprint}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {r.accounts.map(a => (
                    <span key={a} className="text-[9px] font-mono text-slate-400 bg-[#1A1F35] border border-[#28304E] rounded px-1.5 py-0.5">{a}</span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-slate-600 text-[10px]">{r.token}</td>
              <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{r.ts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
)
