import React from 'react'
import { Users, Briefcase, AlertTriangle, Activity, Server, Database, Radio, Lock } from 'lucide-react'
import type { User } from '../data/auth'

interface OverviewProps {
  user: User
  accounts?: User[]
  staffData?: unknown[]
}

const STATS = [
  { label: 'Active Agents',  value: '24',   icon: Users,          color: 'text-blue-400',  bg: 'bg-blue-500/8',  border: 'border-blue-500/20' },
  { label: 'Open Cases',     value: '7',    icon: Briefcase,      color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/20' },
  { label: 'Active Threats', value: '3',    icon: AlertTriangle,  color: 'text-red-400',   bg: 'bg-red-500/8',   border: 'border-red-500/20' },
  { label: 'System Uptime',  value: '99.9%', icon: Activity,      color: 'text-green-400', bg: 'bg-green-500/8', border: 'border-green-500/20' },
]

const FEED = [
  { time: '14:32:07Z', dot: 'blue'  as const, text: 'RAVEN authenticated from SCIF-7 terminal',            tag: 'AUTH' },
  { time: '14:28:54Z', dot: 'amber' as const, text: 'WRAITH accessed BYZANTINE_HADES_BRIEF.pdf',           tag: 'VAULT' },
  { time: '14:19:11Z', dot: 'red'   as const, text: 'Anomalous traffic detected — QUANTUM node 4',         tag: 'ALERT' },
  { time: '14:07:33Z', dot: 'green' as const, text: 'SPECTER sent encrypted message to DIRECTOR',          tag: 'COMMS' },
  { time: '13:55:02Z', dot: 'blue'  as const, text: 'CIPHER uploaded SIGINT_REPORT_Q3.pdf [TS//SCI]',      tag: 'VAULT' },
  { time: '13:41:18Z', dot: 'blue'  as const, text: 'ORACLE authenticated from mobile terminal',           tag: 'AUTH' },
]

const DOT: Record<string, string> = {
  blue:  'bg-blue-400',
  amber: 'bg-amber-400',
  red:   'bg-red-400',
  green: 'bg-green-400',
}

const TAG_COLOR: Record<string, string> = {
  AUTH:  'text-blue-400  bg-blue-500/10  border-blue-500/20',
  VAULT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  ALERT: 'text-red-400   bg-red-500/10   border-red-500/20',
  COMMS: 'text-green-400 bg-green-500/10 border-green-500/20',
}

const STATUS = [
  { label: 'NSANET CORE',  icon: Server,   ok: true  },
  { label: 'DATABASE',     icon: Database, ok: true  },
  { label: 'COMMS RELAY',  icon: Radio,    ok: true  },
  { label: 'VAULT ACCESS', icon: Lock,     ok: true  },
]

export default function Overview({ user }: OverviewProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-100 tracking-wide">Operations Overview</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Welcome back, <span className="text-blue-400 font-mono">{user.codename}</span> — session active
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <Icon size={16} className={s.color} />
              </div>
              <div className={`text-2xl font-bold tracking-tight ${s.color} mb-0.5`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-300">Activity Feed</span>
            <span className="text-[10px] font-mono text-slate-600">24H</span>
          </div>
          <div className="divide-y divide-[#1A1F35]">
            {FEED.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#111627]/50 transition-colors">
                <span className="font-mono text-[10px] text-slate-600 w-16 flex-shrink-0">{row.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[row.dot]}`} />
                <span className="flex-1 text-[12px] text-slate-300 truncate">{row.text}</span>
                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border
                  flex-shrink-0 ${TAG_COLOR[row.tag] ?? 'text-slate-500 bg-slate-800 border-slate-700'}`}>
                  {row.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System status */}
        <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1E2540]">
            <span className="text-[12px] font-semibold text-slate-300">System Status</span>
          </div>
          <div className="p-5 space-y-3">
            {STATUS.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className="text-slate-600" />
                    <span className="text-[12px] text-slate-400 font-mono">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-red-500'}`} />
                    <span className={`text-[10px] font-mono ${s.ok ? 'text-green-500' : 'text-red-400'}`}>
                      {s.ok ? 'ONLINE' : 'FAULT'}
                    </span>
                  </div>
                </div>
              )
            })}

            <div className="pt-3 mt-1 border-t border-[#1E2540] space-y-2">
              {[
                ['LOAD',     '12%'],
                ['LATENCY',  '4ms'],
                ['SESSIONS', '24 active'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between font-mono text-[10px]">
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
}
