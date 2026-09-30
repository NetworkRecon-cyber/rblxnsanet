import React, { useState } from 'react'
import { AlertOctagon, Globe, Wifi, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { User } from '../data/auth'

// ─── Shared helpers (duplicated to avoid cross-file import complexity) ─────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface CollectionSite {
  id:       string
  location: string
  cover:    string
  status:   'OPERATIONAL' | 'MAINTENANCE' | 'BURNED'
  dailyVol: string
  since:    string
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SITES: CollectionSite[] = [
  { id: 'SCS-01', location: 'MOSCOW, RU',    cover: 'US Embassy — Political Section',  status: 'OPERATIONAL', dailyVol: '38 GB', since: '2018-04-01' },
  { id: 'SCS-02', location: 'BEIJING, CN',   cover: 'US Embassy — Economic Attaché',  status: 'OPERATIONAL', dailyVol: '51 GB', since: '2017-09-12' },
  { id: 'SCS-03', location: 'BERLIN, DE',    cover: 'US Consulate — Cultural Affairs', status: 'MAINTENANCE', dailyVol: '0 GB',  since: '2019-03-03' },
  { id: 'SCS-04', location: 'TEHRAN, IR',    cover: 'Third-party relay station',       status: 'OPERATIONAL', dailyVol: '22 GB', since: '2021-06-17' },
  { id: 'SCS-05', location: 'PYONGYANG, KP', cover: 'Diplomatic support facility',     status: 'BURNED',      dailyVol: '0 GB',  since: '2022-11-30' },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const SITE_STYLE: Record<string, string> = {
  OPERATIONAL: 'text-green-400 bg-green-950/50 border-green-800/50',
  MAINTENANCE: 'text-slate-400 bg-slate-900/50 border-slate-700/50',
  BURNED:      'text-red-400   bg-red-950/50   border-red-800/50',
}

const BLANK_SITE: CollectionSite = { id: '', location: '', cover: '', status: 'OPERATIONAL', dailyVol: '', since: '' }

// ─── Component ───────────────────────────────────────────────────────────────

export const SCS: React.FC<{ user: User }> = ({ user }) => {
  const [sites,  setSites]  = useLocalState<CollectionSite[]>('nsanet_scs_sites', DEFAULT_SITES)
  const [sModal, setSModal] = useState<{ mode: 'add' | 'edit'; idx: number } | null>(null)
  const [sForm,  setSForm]  = useState<CollectionSite>(BLANK_SITE)

  function sfld(k: keyof CollectionSite) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setSForm(f => ({ ...f, [k]: e.target.value })) }

  function saveSite() {
    if (!sForm.id || !sForm.location) return
    if (sModal!.mode === 'add') setSites(p => [sForm, ...p])
    else setSites(p => p.map((x, i) => i === sModal!.idx ? sForm : x))
    setSModal(null)
  }

  const activeSites = sites.filter(s => s.status === 'OPERATIONAL').length
  const totalVol    = sites.filter(s => s.status === 'OPERATIONAL')
    .reduce((a, s) => a + (parseFloat(s.dailyVol) || 0), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 rounded-xl px-5 py-3.5">
        <AlertOctagon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-red-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — SCS ACCESS ONLY</div>
          <div className="text-red-500/60 font-mono text-[10px] mt-0.5">
            SPECIAL COLLECTION SERVICE // TS//SI//TK//NOFORN
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-slate-100 tracking-wide">SCS Collection Operations</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Operator: <span className="font-mono text-blue-400">{user.codename}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Active Sites',         value: `${activeSites}/${sites.length}`, icon: Globe, color: 'text-blue-400',  border: 'border-blue-500/20',  bg: 'bg-blue-500/8'  },
          { label: 'Daily Collection Vol', value: `${totalVol} GB`,                 icon: Wifi,  color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/8' },
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

      {/* SCS Sites */}
      <div className="bg-[#0C0F1A] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-300">Embassy Collection Sites</span>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/40 border border-blue-800/50 px-2 py-0.5 rounded">SCS</span>
            <AddBtn onClick={() => { setSForm(BLANK_SITE); setSModal({ mode: 'add', idx: -1 }) }} label="Add Site" />
          </div>
        </div>
        <div className="divide-y divide-[#1A1F35]">
          {sites.map((site, i) => (
            <div key={i} className="px-5 py-3 hover:bg-[#111627]/60 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Globe size={12} className="text-slate-600" />
                  <span className="font-mono text-[11px] font-semibold text-slate-100">{site.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold ${SITE_STYLE[site.status]}`}>
                    {site.status}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionBtns onEdit={() => { setSForm({ ...site }); setSModal({ mode: 'edit', idx: i }) }} onDelete={() => setSites(p => p.filter((_, j) => j !== i))} />
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mb-1">{site.cover}</div>
              <div className="flex gap-4 font-mono text-[9px] text-slate-600">
                <span>ID: {site.id}</span>
                <span>VOL: {site.dailyVol}/day</span>
                <span>SINCE: {site.since}</span>
              </div>
            </div>
          ))}
          {sites.length === 0 && <div className="px-5 py-6 text-center text-[11px] text-slate-600 font-mono">NO SITES ON RECORD</div>}
        </div>
      </div>

      {sModal && (
        <Modal title={sModal.mode === 'add' ? 'NEW COLLECTION SITE' : 'EDIT SITE'} onClose={() => setSModal(null)} onSave={saveSite}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Site ID"><input className={inp} value={sForm.id} onChange={sfld('id')} placeholder="SCS-06" /></Field>
            <Field label="Location"><input className={inp} value={sForm.location} onChange={sfld('location')} placeholder="BERLIN, DE" /></Field>
            <Field label="Cover Identity"><input className={inp} value={sForm.cover} onChange={sfld('cover')} placeholder="US Embassy — Cultural Affairs" /></Field>
            <Field label="Daily Volume"><input className={inp} value={sForm.dailyVol} onChange={sfld('dailyVol')} placeholder="38 GB" /></Field>
            <Field label="Active Since"><input className={inp} value={sForm.since} onChange={sfld('since')} placeholder="2024-01-01" /></Field>
            <Field label="Status">
              <select className={sel} value={sForm.status} onChange={sfld('status')}>
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="BURNED">BURNED</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default SCS
