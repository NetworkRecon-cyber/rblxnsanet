import React, { useState } from 'react'
import { Search, ShieldOff } from 'lucide-react'
import { hasPermission } from '../data/auth'
import type { User } from '../data/auth'

interface StaffProps {
  user:      User
  accounts?: User[]
}

const CLR: Record<string, string> = {
  'TS/SCI/SAP':    'text-red-400   border-red-800/60   bg-red-950/40',
  'TS/SCI + ECI':  'text-red-400   border-red-800/60   bg-red-950/40',
  'TS/SCI':        'text-amber-400 border-amber-800/60 bg-amber-950/40',
  'TS':            'text-yellow-400 border-yellow-800/60 bg-yellow-950/40',
  'SECRET':        'text-blue-400  border-blue-800/60  bg-blue-950/40',
}

const STATUS_STYLE: Record<string, string> = {
  active:    'text-green-400 bg-green-950/50 border-green-800/50',
  ACTIVE:    'text-green-400 bg-green-950/50 border-green-800/50',
  inactive:  'text-slate-500 bg-slate-900/50 border-slate-700/50',
  INACTIVE:  'text-slate-500 bg-slate-900/50 border-slate-700/50',
  suspended: 'text-red-400   bg-red-950/50   border-red-800/50',
  SUSPENDED: 'text-red-400   bg-red-950/50   border-red-800/50',
}

export default function Staff({ user, accounts = [] }: StaffProps) {
  const [query, setQuery] = useState('')

  if (!hasPermission(user, 'staffView')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <ShieldOff size={32} className="text-red-500/60" />
        <div className="text-red-400 font-mono text-sm tracking-widest">ACCESS DENIED</div>
        <div className="text-slate-600 font-mono text-[11px]">STAFFVIEW PERMISSION REQUIRED</div>
      </div>
    )
  }

  const visible = user.role === 'admin'
    ? accounts
    : accounts.filter(u => u.role !== 'admin')

  const filtered = visible.filter(u =>
    u.codename.toLowerCase().includes(query.toLowerCase()) ||
    (u.dept ?? '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-wide">Staff Directory</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">NSANET personnel — {filtered.length} records</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search codename or dept..."
            className="bg-[#0C0F1A] border border-[#1E2540] rounded-lg pl-8 pr-3 py-2
              text-[12px] text-slate-300 outline-none transition-all w-56
              focus:border-blue-500/60 placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['ID', 'Codename', 'Role', 'Clearance', 'Dept', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-[#111627]/60 transition-colors">
                <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px]">{u.id}</td>
                <td className="px-5 py-3.5 font-mono font-semibold text-slate-100 tracking-wide">{u.codename}</td>
                <td className="px-5 py-3.5 text-slate-400">{u.rank ?? u.role}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded px-2 py-0.5 text-[10px] font-mono font-bold
                    ${CLR[u.clearance] ?? 'text-slate-400 border-slate-700 bg-slate-900'}`}>
                    {u.clearance}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">{u.dept ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold
                    ${STATUS_STYLE[u.status] ?? STATUS_STYLE['active']}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-600 font-mono text-[11px]">
                  {accounts.length === 0 ? 'LOADING PERSONNEL DATA...' : 'NO RECORDS MATCHING QUERY'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
