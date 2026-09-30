import React, { useState, useEffect } from 'react'
import { Card, CardHead, StatCard, Btn } from '../components/UI.jsx'
import { apiGetPane, apiSavePane, getToken, API_BASE } from '../data/api.js'
import { CYBERCON_LEVELS } from '../data/auth.js'

function loadCybercon() {
  try { const s = localStorage.getItem('nsanet_cybercon'); return s ? JSON.parse(s).level : 5 } catch { return 5 }
}

export default function Overview({ user, accounts, staffData }) {
  const [cybercon, setCyberconLevel] = useState(loadCybercon)
  const canChange = user?.role === 'director' || user?.role === 'admin'

  const cfg = CYBERCON_LEVELS[cybercon]
  const activeCount = accounts.filter(a => a.status === 'active').length

  function setCybercon(level) {
    if (!canChange) return
    setCyberconLevel(level)
    try { localStorage.setItem('nsanet_cybercon', JSON.stringify({ level, ts: Date.now() })) } catch {}
  }

  // Listen for cross-tab CYBERCON changes
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'nsanet_cybercon' && e.newValue) {
        try { const { level } = JSON.parse(e.newValue); setCyberconLevel(level) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function fmtDate() {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
  }

  async function exportBackup() {
    try {
      const res = await fetch(`${API_BASE}/api/export`, {
        headers: { 'x-session-token': getToken() || '' }
      })
      if (!res.ok) { alert('Export failed'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `nsanet-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Export failed — backend unreachable') }
  }

  async function importBackup(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const res  = await fetch(`${API_BASE}/api/import`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': getToken() || '' },
        body:    JSON.stringify(data),
      })
      const body = await res.json()
      if (res.ok) alert('✓ Backup restored successfully. Refresh the page.')
      else alert('Import failed: ' + body.error)
    } catch { alert('Import failed — invalid file or backend unreachable') }
    e.target.value = ''
  }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Operations Overview</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1 tracking-[0.04em]">
            {user?.clearance} // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
        <div className="font-mono text-[10px] text-slate-500 text-right">
          {fmtDate()}<br />
          <span className="text-slate-600">UTC</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard num={activeCount} label="Active Agents" />
        <StatCard num={0} label="Active Ops" color="text-amber-400" />
        <StatCard num={0} label="Priority Incidents" color="text-red-400" />
      </div>

      {/* Activity feed */}
      <Card className="mb-4">
        <CardHead>Activity Feed — Last 24H</CardHead>
        <div className="text-xs text-slate-500 py-3">No activity recorded.</div>
      </Card>

      {/* CYBERCON */}
      <Card>
        <CardHead>
          <div className="flex items-center justify-between">
            <span>CYBERCON Status</span>
            <span className="text-[9px] text-slate-600 normal-case font-normal tracking-normal">
              {canChange ? 'Click a level to change' : 'View only — Director+ required'}
            </span>
          </div>
        </CardHead>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => {
              const c = CYBERCON_LEVELS[i]
              const active = i === cybercon
              return (
                <div key={i}
                  onClick={() => setCybercon(i)}
                  title={c.label}
                  style={{
                    background: c.color,
                    opacity: active ? 1 : 0.18,
                    boxShadow: active ? `0 0 14px ${c.glow}` : 'none',
                    border: `2px solid ${active ? c.color : 'transparent'}`,
                    cursor: canChange ? 'pointer' : 'not-allowed',
                  }}
                  className="w-9 h-9 rounded flex items-center justify-center font-bold text-[15px] text-white transition-all">
                  {i}
                </div>
              )
            })}
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-[0.03em]" style={{ color: cfg.textColor }}>
              {cfg.label}
            </div>
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">{cfg.desc}</div>
          </div>
        </div>
      </Card>

      {/* Backup — admin only */}
      {user?.role === 'admin' && (
        <Card>
          <CardHead>Data Backup</CardHead>
          <p className="text-xs text-slate-500 mb-4 font-mono">
            Export all data before redeploying the backend. Import to restore after a redeploy.
          </p>
          <div className="flex gap-3">
            <Btn onClick={exportBackup}>
              ↓ Export Backup
            </Btn>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-[0.04em] transition-all cursor-pointer bg-transparent text-slate-300 border border-[#28304E] hover:border-blue-500 hover:text-blue-400">
              ↑ Import Backup
              <input type="file" accept=".json" className="hidden" onChange={importBackup} />
            </label>
          </div>
        </Card>
      )}
    </div>
  )
}
