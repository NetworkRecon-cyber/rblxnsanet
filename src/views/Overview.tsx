import React, { useState, useEffect } from 'react'
import { Users, Briefcase, AlertTriangle, Activity, Server, Database, Radio, Lock, Plus, X } from 'lucide-react'
import type { User } from '../data/auth'
import { supabase } from '../data/supabase'
import { fetchFeed, deleteFeedEvent, insertFeedEvent } from '../data/feed'
import type { FeedEvent, FeedTag, FeedDot } from '../data/feed'

interface OverviewProps {
  user: User
  accounts?: User[]
  staffData?: unknown[]
}

// types re-exported from feed.ts for local use
type FeedEntry = FeedEvent

// ── counters stored in localStorage ──────────────────────────────────────────

function loadCounters(): { cases: number; threats: number } {
  try { const s = localStorage.getItem('nsanet_overview_counters'); return s ? JSON.parse(s) : { cases: 7, threats: 3 } } catch { return { cases: 7, threats: 3 } }
}
function saveCounters(c: { cases: number; threats: number }) {
  try { localStorage.setItem('nsanet_overview_counters', JSON.stringify(c)) } catch {}
}

// ── styles ───────────────────────────────────────────────────────────────────

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

const BLANK_ENTRY = { time: '', dot: 'blue' as FeedDot, text: '', tag: 'AUTH' as FeedTag }

const inp = 'bg-[#111627] border border-[#28304E] rounded px-2 py-1 text-slate-100 text-[11px] outline-none focus:border-blue-500 font-mono'
const sel = inp + ' cursor-pointer'

// ── component ─────────────────────────────────────────────────────────────────

export default function Overview({ user, accounts = [] }: OverviewProps) {
  const [feed,       setFeed]       = useState<FeedEntry[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [counters,   setCounters]   = useState(loadCounters)
  const [dbSessions, setDbSessions] = useState<number | null>(null)
  const [addOpen,    setAddOpen]    = useState(false)
  const [newEntry,   setNewEntry]   = useState(BLANK_ENTRY)

  // ── initial feed load ──
  useEffect(() => {
    fetchFeed(20).then(rows => { setFeed(rows); setFeedLoading(false) })
  }, [])

  // ── realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel('feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed' }, () => {
        fetchFeed(20).then(setFeed)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── pull live session count from Supabase ──
  useEffect(() => {
    supabase.from('users').select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setDbSessions(count) })
      .catch(() => {})
  }, [])

  function updateCounter(key: 'cases' | 'threats', delta: number) {
    setCounters(prev => {
      const next = { ...prev, [key]: Math.max(0, prev[key] + delta) }
      saveCounters(next)
      return next
    })
  }

  async function addFeedEntry() {
    if (!newEntry.text.trim()) return
    const entry = {
      ...newEntry,
      time: newEntry.time || new Date().toISOString().slice(11, 19) + 'Z',
    }
    await insertFeedEvent(entry)
    setAddOpen(false)
    setNewEntry(BLANK_ENTRY)
  }

  async function handleDeleteFeed(id: number | undefined) {
    if (!id) return
    await deleteFeedEvent(id)
  }

  // ── derived stats ──
  const visibleAccounts = user.role === 'admin' ? accounts : accounts.filter(a => a.role !== 'admin')
  const activeAgents = visibleAccounts.filter(a => a.status === 'active').length || visibleAccounts.length
  const sessions     = dbSessions ?? accounts.length

  const STATS = [
    { label: 'Active Agents',  value: activeAgents.toString(), icon: Users,         color: 'text-blue-400',  bg: 'bg-blue-500/8',  border: 'border-blue-500/20' },
    { label: 'Open Cases',     value: counters.cases.toString(), icon: Briefcase,   color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/20', key: 'cases'   as const },
    { label: 'Active Threats', value: counters.threats.toString(), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/20',  key: 'threats' as const },
    { label: 'System Uptime',  value: '99.9%',                  icon: Activity,     color: 'text-green-400', bg: 'bg-green-500/8', border: 'border-green-500/20' },
  ]

  const STATUS = [
    { label: 'NSANET CORE',  icon: Server,   ok: true },
    { label: 'DATABASE',     icon: Database, ok: dbSessions !== null },
    { label: 'COMMS RELAY',  icon: Radio,    ok: true },
    { label: 'VAULT ACCESS', icon: Lock,     ok: true },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">

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
              <Icon size={16} className={`${s.color} mb-3`} />
              <div className={`text-2xl font-bold tracking-tight ${s.color} mb-0.5`}>{s.value}</div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
                {'key' in s && s.key && (
                  <div className="flex gap-1">
                    <button onClick={() => updateCounter(s.key!, -1)} className="text-slate-600 hover:text-slate-300 text-[11px] font-mono leading-none cursor-pointer bg-transparent border-none px-0.5">−</button>
                    <button onClick={() => updateCounter(s.key!, +1)} className="text-slate-600 hover:text-slate-300 text-[11px] font-mono leading-none cursor-pointer bg-transparent border-none px-0.5">+</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-300">Activity Feed</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-600">24H</span>
              <button onClick={() => setAddOpen(v => !v)}
                className="flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer">
                <Plus size={11} /> ADD
              </button>
            </div>
          </div>

          {addOpen && (
            <div className="px-5 py-3 border-b border-[#1E2540] bg-[#111627] flex flex-wrap gap-2 items-end">
              <input className={inp + ' w-24'} placeholder="HH:MM:SSZ" value={newEntry.time}
                onChange={e => setNewEntry(p => ({ ...p, time: e.target.value }))} />
              <select className={sel} value={newEntry.tag}
                onChange={e => setNewEntry(p => ({ ...p, tag: e.target.value as FeedEntry['tag'] }))}>
                <option>AUTH</option><option>VAULT</option><option>ALERT</option><option>COMMS</option>
              </select>
              <select className={sel} value={newEntry.dot}
                onChange={e => setNewEntry(p => ({ ...p, dot: e.target.value as FeedEntry['dot'] }))}>
                <option value="blue">blue</option><option value="amber">amber</option>
                <option value="red">red</option><option value="green">green</option>
              </select>
              <input className={inp + ' flex-1 min-w-[180px]'} placeholder="Event description…" value={newEntry.text}
                onChange={e => setNewEntry(p => ({ ...p, text: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addFeedEntry()} />
              <button onClick={addFeedEntry}
                className="px-3 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-mono cursor-pointer border-none">
                ADD
              </button>
            </div>
          )}

          <div className="divide-y divide-[#1A1F35]">
            {feedLoading && (
              <div className="px-5 py-6 text-center text-[11px] text-slate-600 font-mono animate-pulse">LOADING FEED…</div>
            )}
            {!feedLoading && feed.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#111627]/50 transition-colors group">
                <span className="font-mono text-[10px] text-slate-600 w-16 flex-shrink-0">{row.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[row.dot]}`} />
                <span className="flex-1 text-[12px] text-slate-300 truncate">{row.text}</span>
                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border flex-shrink-0
                  ${TAG_COLOR[row.tag] ?? 'text-slate-500 bg-slate-800 border-slate-700'}`}>
                  {row.tag}
                </span>
                <button onClick={() => handleDeleteFeed(row.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 bg-transparent border-none cursor-pointer transition-opacity p-0">
                  <X size={11} />
                </button>
              </div>
            ))}
            {!feedLoading && feed.length === 0 && (
              <div className="px-5 py-6 text-center text-[11px] text-slate-600 font-mono">NO ACTIVITY ON RECORD</div>
            )}
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
                ['SESSIONS', `${sessions} active`],
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
