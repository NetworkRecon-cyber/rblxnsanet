import React, { useState, useEffect } from 'react'
import { Search, LogOut } from 'lucide-react'
import { RoleBadge } from './UI'
import type { User } from '../data/auth'

interface TopbarProps {
  user:      User
  sessionId: string
  onLogout:  () => void
  onGoBar:   () => void
}

function utcClock(): string {
  const n = new Date()
  return [n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':') + 'Z'
}

export default function Topbar({ user, sessionId, onLogout, onGoBar }: TopbarProps) {
  const [clock, setClock] = useState(utcClock())
  useEffect(() => {
    const t = setInterval(() => setClock(utcClock()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="h-11 bg-[#0A0D16] border-b border-[#1A1F35] flex items-center px-4 gap-3 flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2 w-[184px] flex-shrink-0">
        <img src="/rblxnsanet/nsa-seal.png" alt="NSA" className="w-6 h-6 rounded-full object-contain flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-100 tracking-[0.08em]">NSANET</span>
        <span className="bg-blue-600/20 text-blue-400 text-[9px] font-bold px-1.5 py-0.5
          rounded font-mono tracking-[0.06em] border border-blue-600/30">TS//SCI</span>
      </div>

      {/* Go bar */}
      <button onClick={onGoBar}
        className="flex items-center gap-2 bg-[#111627] border border-[#1E2540]
          rounded-md px-3 py-1.5 font-mono text-[11px] text-slate-500
          hover:border-blue-600/60 hover:text-blue-400 transition-all cursor-pointer
          min-w-[180px]">
        <Search size={11} />
        <span className="flex-1 text-left">Go to...</span>
        <kbd className="bg-[#1A1F35] text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">⌃K</kbd>
      </button>

      <div className="flex-1" />

      {/* Clock */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
        <span>{clock}</span>
      </div>

      <div className="w-px h-4 bg-[#1E2540]" />

      {/* User info */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-slate-300">{user.codename}</span>
        <RoleBadge role={user.role} />
        <span className="font-mono text-[10px] text-amber-600/80">{user.clearance}</span>
      </div>

      <div className="w-px h-4 bg-[#1E2540]" />

      {/* Logout */}
      <button onClick={onLogout}
        className="flex items-center gap-1.5 text-[11px] text-slate-500
          hover:text-red-400 transition-colors cursor-pointer px-1">
        <LogOut size={12} />
        <span className="font-mono">Logout</span>
      </button>
    </header>
  )
}
