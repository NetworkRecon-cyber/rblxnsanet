import React from 'react'

const STATUS_DOT = {
  online:  'bg-green-500 shadow-[0_0_4px_#22c55e]',
  away:    'bg-amber-500',
  offline: 'bg-slate-600',
}

export default function Staff({ accounts }) {
  const activeAccounts = accounts.filter(a => a.status === 'active')

  // Derive staff display from accounts
  const staffCards = activeAccounts.map(a => ({
    init: a.codename.slice(0, 2),
    name: a.codename,
    rank: a.rank || 'Staff',
    dept: a.dept || '—',
    status: 'online',
    rbx: a.rbx,
  }))

  const online  = staffCards.filter(s => s.status === 'online').length
  const away    = staffCards.filter(s => s.status === 'away').length
  const offline = staffCards.filter(s => s.status === 'offline').length

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Staff Roster</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">
            AUTHORIZED PERSONNEL ONLY — {activeAccounts.length} ACTIVE AGENTS
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono border bg-green-950 text-green-400 border-green-800">{online} Online</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono border bg-amber-950 text-amber-400 border-amber-800">{away} Away</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono border bg-[#111627] text-slate-400 border-[#28304E]">{offline} Offline</span>
        </div>
      </div>

      {staffCards.length === 0 ? (
        <div className="text-sm text-slate-500 pt-4">No staff on roster.</div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {staffCards.map((s, i) => (
            <div key={i} className="bg-[#0C0F1A] border border-[#1E2540] rounded-md p-4 hover:border-[#28304E] transition-colors">
              <div className="w-11 h-11 bg-blue-950 border border-blue-800/40 rounded flex items-center justify-center text-sm font-bold text-blue-400 mb-3">
                {s.init}
              </div>
              <div className="text-[14px] font-semibold text-slate-100 mb-0.5">{s.name}</div>
              <div className="font-mono text-[9px] text-blue-400 uppercase tracking-[0.1em] mb-1.5">{s.rank}</div>
              <div className="text-[11px] text-slate-500 mb-2.5">{s.dept}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status]}`} />
                {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
