import React, { useState, useEffect } from 'react'
import { Search, Lock, LogOut } from 'lucide-react'
import { RoleBadge } from './UI.jsx'

function utcClock() {
  const n = new Date()
  return [n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':') + 'Z'
}

export default function Topbar({ user, sessionId, onLogout, onGoBar }) {
  const [clock, setClock] = useState(utcClock())
  useEffect(() => {
    const t = setInterval(() => setClock(utcClock()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-12 bg-[#0C0F1A] border-b border-[#1E2540] flex items-center
      px-6 gap-3.5 flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-slate-100 tracking-[0.05em]">NSANET</span>
        <span className="bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5
          rounded font-mono tracking-[0.06em]">TS//SCI</span>
      </div>

      <div className="w-px h-5 bg-[#1E2540]" />
      <span className="font-mono text-[10px] text-slate-500">PORTAL v3.2</span>

      <div className="flex-1" />

      {/* Fake URL bar */}
      {sessionId && (
        <div className="hidden lg:flex items-center gap-1.5 bg-[#111627] border border-[#1E2540]
          rounded px-2.5 py-1 max-w-[480px]">
          <Lock size={9} className="text-green-500 flex-shrink-0" />
          <span className="font-mono text-[10px] text-slate-400 truncate">
            <span className="text-slate-600">https://</span>
            <span className="text-slate-200">nsanet.nsa.gov</span>
            <span className="text-slate-600">/portal/session/</span>
            <span className="text-blue-400">{sessionId}</span>
          </span>
        </div>
      )}

      {/* Go bar trigger */}
      <button onClick={onGoBar}
        className="flex items-center gap-2 bg-[#111627] border border-[#1E2540]
          rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-500
          hover:border-blue-600 hover:text-blue-400 transition-all cursor-pointer">
        <Search size={11} />
        Go to...
        <kbd className="text-[#1E2540] text-[9px]">Ctrl+K</kbd>
      </button>

      <div className="w-px h-5 bg-[#1E2540]" />

      {/* Status */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
        Secure
      </div>
      <span className="font-mono text-[11px] text-slate-500">{clock}</span>

      <div className="w-px h-5 bg-[#1E2540]" />

      {/* User info */}
      {user && (
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-medium text-slate-100">{user.codename}@nsa.rblx.gov</span>
          <RoleBadge role={user.role} />
          <span className="text-[#1E2540]">|</span>
          <span className="font-mono text-[10px] text-slate-500">
            ID: <span className="text-slate-300">{user.id}</span>
          </span>
          <span className="text-[#1E2540]">|</span>
          <span className="font-mono text-[10px] text-slate-500">
            CLR: <span className="text-amber-400">{user.clearance}</span>
          </span>
        </div>
      )}

      <div className="w-px h-5 bg-[#1E2540]" />

      <button onClick={onLogout}
        className="flex items-center gap-1.5 text-[11px] text-slate-400
          hover:text-slate-100 transition-colors cursor-pointer">
        <LogOut size={12} />
        Logout
      </button>
    </div>
  )
}
