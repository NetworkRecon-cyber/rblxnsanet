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

// ─── Analytics ────────────────────────────────────────────────────────────────

const THREAT_METRICS = [
  { label: 'NATION-STATE',   count: 12, pct: 80 },
  { label: 'RANSOMWARE',     count: 7,  pct: 47 },
  { label: 'INSIDER THREAT', count: 3,  pct: 20 },
  { label: 'ZERO-DAY',       count: 2,  pct: 13 },
]

export const Analytics: React.FC<{ user: User }> = ({ user }) => (
  <div className="max-w-5xl mx-auto space-y-5">

    {/* Header */}
    <div>
      <h1 className="text-lg font-semibold text-slate-100 tracking-wide">SIGINT Analytics</h1>
      <p className="text-[12px] text-slate-500 mt-0.5">
        Collection statistics — Operator: <span className="font-mono text-blue-400">{user.codename}</span>
      </p>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Daily Intercepts',      value: '4.2M',   icon: Radio,       color: 'text-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/8'   },
        { label: 'Processed',             value: '1.8M',   icon: BarChart2,   color: 'text-green-400',  border: 'border-green-500/20',  bg: 'bg-green-500/8'  },
        { label: 'Flagged for Review',    value: '47,221', icon: AlertOctagon,color: 'text-amber-400',  border: 'border-amber-500/20',  bg: 'bg-amber-500/8'  },
        { label: 'Active Collection Pts', value: '8,943',  icon: TrendingUp,  color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/8' },
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Collection rate */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E2540]">
          <span className="text-[12px] font-semibold text-slate-300">Collection Rate — 7-Day</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { day: 'MON', rate: 87 },
            { day: 'TUE', rate: 92 },
            { day: 'WED', rate: 78 },
            { day: 'THU', rate: 95 },
            { day: 'FRI', rate: 88 },
            { day: 'SAT', rate: 61 },
            { day: 'SUN', rate: 70 },
          ].map(d => (
            <div key={d.day} className="flex items-center gap-3">
              <div className="w-8 text-slate-600 font-mono text-[10px]">{d.day}</div>
              <div className="flex-1 h-3 bg-[#111627] rounded-full overflow-hidden">
                <div className="h-full bg-blue-600/70 transition-all rounded-full" style={{ width: `${d.rate}%` }} />
              </div>
              <div className="w-8 text-slate-400 font-mono text-[10px] text-right">{d.rate}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat breakdown */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E2540]">
          <span className="text-[12px] font-semibold text-slate-300">Threat Category Breakdown</span>
        </div>
        <div className="p-5 space-y-4">
          {THREAT_METRICS.map(m => (
            <div key={m.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300 font-mono text-[11px]">{m.label}</span>
                <span className="text-slate-500 font-mono text-[11px]">{m.count} active</span>
              </div>
              <div className="h-2 bg-[#111627] rounded-full overflow-hidden">
                <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}

          <div className="border-t border-[#1E2540] pt-4 space-y-2">
            {[
              ['Daily Intercepts',   '4.2M'],
              ['Processed',          '1.8M'],
              ['Flagged for Review', '47,221'],
              ['Forwarded to FBI',   '112'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-600">{k}</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
)
