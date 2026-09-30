import React, { useState } from 'react'
import { AlertOctagon, Target, Zap, BarChart2, Radio, Globe, TrendingUp, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { User } from '../data/auth'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function useLocalState<T>(key: string, init: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  function set(v: React.SetStateAction<T>) {
    setVal(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }
  return [val, set]
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">{label}</label>
      {children}
    </div>
  )
}

const inp = 'w-full bg-[#111627] border border-[#28304E] rounded px-3 py-2 text-slate-100 text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
const sel = inp + ' cursor-pointer'

function Modal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[7000] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0C0F1A] border border-[#28304E] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2540]">
          <span className="font-mono text-[12px] font-semibold text-slate-200 tracking-wide">{title}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer border-none bg-transparent"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#1E2540]">
          <button onClick={onClose} className="px-4 py-2 text-[12px] text-slate-400 hover:text-slate-200 border border-[#28304E] rounded-lg transition-colors cursor-pointer bg-transparent">Cancel</button>
          <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 text-[12px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer border-none font-semibold">
            <Check size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  )
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/40 rounded-lg transition-colors cursor-pointer">
      <Plus size={12} />{label}
    </button>
  )
}

function ActionBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onEdit} className="p-1 text-slate-600 hover:text-blue-400 transition-colors cursor-pointer border-none bg-transparent"><Pencil size={11} /></button>
      <button onClick={onDelete} className="p-1 text-slate-600 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"><Trash2 size={11} /></button>
    </div>
  )
}

// ─── TAO ──────────────────────────────────────────────────────────────────────

interface Operation {
  codename:  string
  status:    'ACTIVE' | 'DORMANT' | 'COMPROMISED'
  target:    string
  type:      'CNE' | 'CNA' | 'SIGINT'
  initiated: string
  officer:   string
}

const DEFAULT_OPS: Operation[] = [
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

const BLANK_OP: Operation = { codename: '', status: 'ACTIVE', target: '', type: 'CNE', initiated: '', officer: '' }

export const TAO: React.FC<{ user: User }> = ({ user }) => {
  const [ops, setOps] = useLocalState<Operation[]>('nsanet_tao_ops', DEFAULT_OPS)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; idx: number } | null>(null)
  const [form, setForm] = useState<Operation>(BLANK_OP)

  function openAdd() { setForm(BLANK_OP); setModal({ mode: 'add', idx: -1 }) }
  function openEdit(i: number) { setForm({ ...ops[i] }); setModal({ mode: 'edit', idx: i }) }
  function del(i: number) { setOps(prev => prev.filter((_, j) => j !== i)) }
  function save() {
    if (!form.codename || !form.target) return
    if (modal!.mode === 'add') setOps(prev => [form, ...prev])
    else setOps(prev => prev.map((o, i) => i === modal!.idx ? form : o))
    setModal(null)
  }
  function fld(k: keyof Operation) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const activeCount = ops.filter(o => o.status === 'ACTIVE').length

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 rounded-xl px-5 py-3.5">
        <AlertOctagon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-red-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — TAO ACCESS ONLY</div>
          <div className="text-red-500/60 font-mono text-[10px] mt-0.5">TAILORED ACCESS OPERATIONS CENTER // TS//SI//TK//NOFORN</div>
        </div>
      </div>

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

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Ops',        value: activeCount.toString(), icon: Zap,    color: 'text-red-400',   border: 'border-red-500/20',   bg: 'bg-red-500/8'   },
          { label: 'Total Operations',  value: ops.length.toString(),  icon: Globe,  color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/8' },
          { label: 'Compromised',       value: ops.filter(o => o.status === 'COMPROMISED').length.toString(), icon: Target, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/8' },
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

      <div className="bg-[#0C0F1A] border border-red-900/30 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-red-900/30 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-red-400">Active Operations</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-600">{ops.length} RECORDS</span>
            <AddBtn onClick={openAdd} label="New Operation" />
          </div>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['Operation', 'Type', 'Target', 'Officer', 'Initiated', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {ops.map((op, i) => (
              <tr key={i} className="hover:bg-red-950/10 transition-colors group">
                <td className="px-5 py-3.5 font-mono font-semibold text-red-300 tracking-wide text-[11px]">{op.codename}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded px-2 py-0.5 text-[9px] font-mono font-bold ${TYPE_STYLE[op.type] ?? 'text-slate-400 border-slate-700'}`}>{op.type}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-[11px]">{op.target}</td>
                <td className="px-5 py-3.5 font-mono text-slate-300 text-[11px]">{op.officer}</td>
                <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">{op.initiated}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${OP_STATUS_STYLE[op.status]}`}>{op.status}</span>
                </td>
                <td className="px-5 py-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionBtns onEdit={() => openEdit(i)} onDelete={() => del(i)} />
                </td>
              </tr>
            ))}
            {ops.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[11px] text-slate-600 font-mono">NO OPERATIONS ON RECORD</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'NEW OPERATION' : 'EDIT OPERATION'} onClose={() => setModal(null)} onSave={save}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Codename">
              <input className={inp} value={form.codename} onChange={fld('codename')} placeholder="BYZANTINE HADES" />
            </Field>
            <Field label="Officer">
              <input className={inp} value={form.officer} onChange={fld('officer')} placeholder="WRAITH" />
            </Field>
            <Field label="Target">
              <input className={inp} value={form.target} onChange={fld('target')} placeholder="Target description" />
            </Field>
            <Field label="Initiated (YYYY-MM-DD)">
              <input className={inp} value={form.initiated} onChange={fld('initiated')} placeholder="2024-01-07" />
            </Field>
            <Field label="Type">
              <select className={sel} value={form.type} onChange={fld('type')}>
                <option value="CNE">CNE</option>
                <option value="CNA">CNA</option>
                <option value="SIGINT">SIGINT</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={sel} value={form.status} onChange={fld('status')}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DORMANT">DORMANT</option>
                <option value="COMPROMISED">COMPROMISED</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

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

interface CollectionRecord {
  uid:         string
  ip:          string
  geo:         string
  provider:    string
  fingerprint: string
  accounts:    string
  token:       string
  ts:          string
}

const DEFAULT_PROVIDERS: Provider[] = [
  { codename: 'PRISM',     program: 'US-984XN', company: 'Major US Internet Providers', status: 'ACTIVE',   dailyVol: '1.9M',  selectors: '94,871',  established: '2007-09-11' },
  { codename: 'OAKSTAR',   program: 'DS-300',   company: 'Upstream Telecom Partners',   status: 'ACTIVE',   dailyVol: '3.1M',  selectors: '182,440', established: '2004-03-02' },
  { codename: 'STORMBREW', program: 'DS-200B',  company: 'US Backbone Carriers',        status: 'ACTIVE',   dailyVol: '2.4M',  selectors: '71,203',  established: '2006-01-14' },
  { codename: 'BLARNEY',   program: 'DS-200A',  company: 'AT&T / Peering Points',       status: 'DEGRADED', dailyVol: '0.6M',  selectors: '38,009',  established: '1978-10-25' },
  { codename: 'FAIRVIEW',  program: 'DS-200C',  company: 'AT&T Global Backbone',        status: 'ACTIVE',   dailyVol: '4.7M',  selectors: '214,550', established: '1985-07-09' },
  { codename: 'LITHIUM',   program: 'DS-302',   company: 'Foreign Tier-1 Partner',      status: 'OFFLINE',  dailyVol: '—',     selectors: '—',       established: '2010-05-03' },
]

const DEFAULT_RECORDS: CollectionRecord[] = [
  { uid: 'SSO-0041', ip: '91.108.4.XXX',   geo: 'Moscow, RU',    provider: 'STORMBREW', fingerprint: 'Chrome/Win10/x64',   accounts: 'Telegram, VK, ProtonMail', token: 'eyJ...7fQx', ts: '2024-03-14 02:17:43Z' },
  { uid: 'SSO-0042', ip: '185.220.101.XX', geo: 'Frankfurt, DE', provider: 'OAKSTAR',   fingerprint: 'Firefox/Linux/x64',  accounts: 'Signal, ProtonMail',        token: 'eyJ...kR9m', ts: '2024-03-14 03:44:11Z' },
  { uid: 'SSO-0043', ip: '5.188.62.XXX',   geo: 'Beijing, CN',   provider: 'FAIRVIEW',  fingerprint: 'Chrome/Win11/x64',   accounts: 'WeChat, Weibo, QQ',         token: 'eyJ...pL2w', ts: '2024-03-14 06:02:58Z' },
  { uid: 'SSO-0044', ip: '37.19.221.XX',   geo: 'Tehran, IR',    provider: 'BLARNEY',   fingerprint: 'Tor Browser/Win10',  accounts: 'Telegram',                  token: 'eyJ...nX4c', ts: '2024-03-14 07:31:22Z' },
  { uid: 'SSO-0045', ip: '194.165.16.XX',  geo: 'Pyongyang, KP', provider: 'STORMBREW', fingerprint: 'IE11/WinXP/x86',    accounts: '—',                         token: 'eyJ...mQ8s', ts: '2024-03-14 09:15:04Z' },
  { uid: 'SSO-0046', ip: '46.183.220.XX',  geo: 'Minsk, BY',     provider: 'OAKSTAR',   fingerprint: 'Chrome/Android/ARM', accounts: 'Telegram, VK',              token: 'eyJ...rT6p', ts: '2024-03-14 11:49:37Z' },
]

const PROVIDER_STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'text-green-400 bg-green-950/50 border-green-800/50',
  DEGRADED: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
  OFFLINE:  'text-slate-500 bg-slate-900/50 border-slate-700/50',
}

const BLANK_PROVIDER: Provider = { codename: '', program: '', company: '', status: 'ACTIVE', dailyVol: '', selectors: '', established: '' }
const BLANK_RECORD: CollectionRecord = { uid: '', ip: '', geo: '', provider: '', fingerprint: '', accounts: '', token: '', ts: '' }

export const Analytics: React.FC<{ user: User }> = ({ user }) => {
  const [providers, setProviders] = useLocalState<Provider[]>('nsanet_sso_providers', DEFAULT_PROVIDERS)
  const [records,   setRecords]   = useLocalState<CollectionRecord[]>('nsanet_sso_records', DEFAULT_RECORDS)

  const [pModal, setPModal] = useState<{ mode: 'add' | 'edit'; idx: number } | null>(null)
  const [pForm,  setPForm]  = useState<Provider>(BLANK_PROVIDER)
  const [rModal, setRModal] = useState<{ mode: 'add' | 'edit'; idx: number } | null>(null)
  const [rForm,  setRForm]  = useState<CollectionRecord>(BLANK_RECORD)

  function pfld(k: keyof Provider)  { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setPForm(f => ({ ...f, [k]: e.target.value })) }
  function rfld(k: keyof CollectionRecord) { return (e: React.ChangeEvent<HTMLInputElement>) => setRForm(f => ({ ...f, [k]: e.target.value })) }

  function saveProvider() {
    if (!pForm.codename) return
    if (pModal!.mode === 'add') setProviders(p => [pForm, ...p])
    else setProviders(p => p.map((x, i) => i === pModal!.idx ? pForm : x))
    setPModal(null)
  }
  function saveRecord() {
    if (!rForm.uid) return
    if (rModal!.mode === 'add') setRecords(p => [rForm, ...p])
    else setRecords(p => p.map((x, i) => i === rModal!.idx ? rForm : x))
    setRModal(null)
  }

  const activeProviders = providers.filter(p => p.status === 'ACTIVE').length

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start gap-3 bg-violet-950/30 border border-violet-900/50 rounded-xl px-5 py-3.5">
        <AlertOctagon size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-violet-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — SSO ACCESS ONLY</div>
          <div className="text-violet-500/60 font-mono text-[10px] mt-0.5">SPECIAL SOURCE OPERATIONS // TS//COMINT-ECI RGT/NOFORN — OAKSTAR/PRISM COMPARTMENT</div>
        </div>
      </div>

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Daily Intercepts',     value: records.length + 'M',             icon: Radio,        color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/8' },
          { label: 'Active Providers',     value: `${activeProviders} / ${providers.length}`, icon: Globe, color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/8' },
          { label: 'Collection Records',   value: records.length.toString(),         icon: TrendingUp,   color: 'text-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/8'   },
          { label: 'Providers Offline',    value: providers.filter(p => p.status === 'OFFLINE').length.toString(), icon: AlertOctagon, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/8' },
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

      {/* Provider table */}
      <div className="bg-[#0C0F1A] border border-violet-900/30 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-violet-900/30 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-violet-400">Upstream Provider Status</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-600">{providers.length} PROGRAMS</span>
            <AddBtn onClick={() => { setPForm(BLANK_PROVIDER); setPModal({ mode: 'add', idx: -1 }) }} label="Add Provider" />
          </div>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['Codename', 'Program', 'Source', 'Daily Vol', 'Selectors', 'Online Since', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {providers.map((p, i) => (
              <tr key={i} className="hover:bg-violet-950/10 transition-colors group">
                <td className="px-4 py-3 font-mono font-bold text-violet-300 tracking-widest text-[11px]">{p.codename}</td>
                <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{p.program}</td>
                <td className="px-4 py-3 text-slate-400 text-[11px]">{p.company}</td>
                <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">{p.dailyVol}</td>
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{p.selectors}</td>
                <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{p.established}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${PROVIDER_STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionBtns onEdit={() => { setPForm({ ...p }); setPModal({ mode: 'edit', idx: i }) }} onDelete={() => setProviders(prev => prev.filter((_, j) => j !== i))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collection records */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-300">Collection Records</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-600">{records.length} EVENTS</span>
            <AddBtn onClick={() => { setRForm(BLANK_RECORD); setRModal({ mode: 'add', idx: -1 }) }} label="Add Record" />
          </div>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['UID', 'IP', 'Geo', 'Provider', 'Fingerprint', 'Connected Accounts', 'Token', 'Timestamp', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {records.map((r, i) => (
              <tr key={i} className="hover:bg-[#111627] transition-colors group">
                <td className="px-4 py-3 font-mono text-violet-400 text-[10px]">{r.uid}</td>
                <td className="px-4 py-3 font-mono text-slate-300 text-[10px]">{r.ip}</td>
                <td className="px-4 py-3 text-slate-400 text-[11px]">{r.geo}</td>
                <td className="px-4 py-3 font-mono text-[10px]">
                  <span className="text-violet-300 bg-violet-950/40 border border-violet-800/40 rounded px-1.5 py-0.5">{r.provider}</span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{r.fingerprint}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.accounts.split(',').map(a => a.trim()).filter(Boolean).map(a => (
                      <span key={a} className="text-[9px] font-mono text-slate-400 bg-[#1A1F35] border border-[#28304E] rounded px-1.5 py-0.5">{a}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-600 text-[10px]">{r.token}</td>
                <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{r.ts}</td>
                <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionBtns onEdit={() => { setRForm({ ...r }); setRModal({ mode: 'edit', idx: i }) }} onDelete={() => setRecords(prev => prev.filter((_, j) => j !== i))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provider modal */}
      {pModal && (
        <Modal title={pModal.mode === 'add' ? 'NEW PROVIDER' : 'EDIT PROVIDER'} onClose={() => setPModal(null)} onSave={saveProvider}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Codename"><input className={inp} value={pForm.codename} onChange={pfld('codename')} placeholder="PRISM" /></Field>
            <Field label="Program ID"><input className={inp} value={pForm.program} onChange={pfld('program')} placeholder="US-984XN" /></Field>
            <Field label="Source / Company"><input className={inp} value={pForm.company} onChange={pfld('company')} placeholder="Major US Internet Providers" /></Field>
            <Field label="Daily Volume"><input className={inp} value={pForm.dailyVol} onChange={pfld('dailyVol')} placeholder="1.9M" /></Field>
            <Field label="Selectors"><input className={inp} value={pForm.selectors} onChange={pfld('selectors')} placeholder="94,871" /></Field>
            <Field label="Established"><input className={inp} value={pForm.established} onChange={pfld('established')} placeholder="2007-09-11" /></Field>
            <Field label="Status">
              <select className={sel} value={pForm.status} onChange={pfld('status')}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DEGRADED">DEGRADED</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {/* Record modal */}
      {rModal && (
        <Modal title={rModal.mode === 'add' ? 'NEW COLLECTION RECORD' : 'EDIT RECORD'} onClose={() => setRModal(null)} onSave={saveRecord}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="UID"><input className={inp} value={rForm.uid} onChange={rfld('uid')} placeholder="SSO-0047" /></Field>
            <Field label="IP Address"><input className={inp} value={rForm.ip} onChange={rfld('ip')} placeholder="91.108.4.XXX" /></Field>
            <Field label="Geolocation"><input className={inp} value={rForm.geo} onChange={rfld('geo')} placeholder="Moscow, RU" /></Field>
            <Field label="Provider"><input className={inp} value={rForm.provider} onChange={rfld('provider')} placeholder="STORMBREW" /></Field>
            <Field label="Browser Fingerprint"><input className={inp} value={rForm.fingerprint} onChange={rfld('fingerprint')} placeholder="Chrome/Win10/x64" /></Field>
            <Field label="Connected Accounts (comma-sep)"><input className={inp} value={rForm.accounts} onChange={rfld('accounts')} placeholder="Telegram, Signal" /></Field>
            <Field label="Token"><input className={inp} value={rForm.token} onChange={rfld('token')} placeholder="eyJ...xxxx" /></Field>
            <Field label="Timestamp"><input className={inp} value={rForm.ts} onChange={rfld('ts')} placeholder="2024-03-14 02:17:43Z" /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
