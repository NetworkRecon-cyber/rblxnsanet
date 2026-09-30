import React, { useState } from 'react'
import { Plus, Trash2, Award, Star, Shield, Medal } from 'lucide-react'
import { Modal, Field, Input, Select, showToast } from '../components/UI'
import type { User } from '../data/auth'
import { hasPermission } from '../data/auth'

interface AwardEntry {
  id:        string
  recipient: string
  award:     AwardType
  citation:  string
  date:      string
  grantedBy: string
}

type AwardType =
  | 'Intelligence Commendation Medal'
  | 'Meritorious Civilian Service Award'
  | "NSA Director's Award"
  | 'SIGINT Excellence Award'
  | 'Cyber Operations Badge'
  | 'Distinguished Career Intelligence Medal'
  | 'National Intelligence Medal'

const AWARD_META: Record<AwardType, { color: string; icon: React.ComponentType<{ size?: number; className?: string }>; ribbon: string }> = {
  'Intelligence Commendation Medal':         { color: 'text-blue-400',   icon: Medal,  ribbon: 'bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900'     },
  'Meritorious Civilian Service Award':      { color: 'text-green-400',  icon: Award,  ribbon: 'bg-gradient-to-r from-green-900 via-green-600 to-green-900'   },
  "NSA Director's Award":                    { color: 'text-amber-400',  icon: Star,   ribbon: 'bg-gradient-to-r from-amber-900 via-amber-500 to-amber-900'   },
  'SIGINT Excellence Award':                 { color: 'text-purple-400', icon: Shield, ribbon: 'bg-gradient-to-r from-purple-900 via-purple-600 to-purple-900' },
  'Cyber Operations Badge':                  { color: 'text-cyan-400',   icon: Shield, ribbon: 'bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-900'      },
  'Distinguished Career Intelligence Medal': { color: 'text-red-400',    icon: Medal,  ribbon: 'bg-gradient-to-r from-red-900 via-red-600 to-red-900'         },
  'National Intelligence Medal':             { color: 'text-yellow-400', icon: Star,   ribbon: 'bg-gradient-to-r from-yellow-900 via-yellow-500 to-yellow-900' },
}

const ALL_AWARD_TYPES = Object.keys(AWARD_META) as AwardType[]
function uid()   { return 'AWD-' + Math.random().toString(36).slice(2,9).toUpperCase() }
function today() { return new Date().toISOString().slice(0,10) }

export default function Awards({ user }: { user: User }) {
  const [awards,  setAwards]  = useState<AwardEntry[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [delId,   setDelId]   = useState<string | null>(null)
  const [filter,  setFilter]  = useState<AwardType | 'ALL'>('ALL')

  const [fRecipient, setFRecipient] = useState('')
  const [fAward,     setFAward]     = useState<AwardType>('Intelligence Commendation Medal')
  const [fCitation,  setFCitation]  = useState('')
  const [fDate,      setFDate]      = useState(today())
  const [fGranted,   setFGranted]   = useState(user.codename)

  const canEdit = hasPermission(user, 'acctEdit')

  function addAward() {
    if (!fRecipient.trim()) { showToast('Recipient required'); return }
    if (!fCitation.trim())  { showToast('Citation required'); return }
    setAwards(prev => [{
      id: uid(), recipient: fRecipient.trim().toUpperCase(),
      award: fAward, citation: fCitation.trim(),
      date: fDate, grantedBy: fGranted.trim().toUpperCase() || user.codename,
    }, ...prev])
    setAddOpen(false)
    setFRecipient(''); setFCitation(''); setFDate(today())
    setFAward('Intelligence Commendation Medal'); setFGranted(user.codename)
    showToast('Award recorded')
  }

  function deleteAward() {
    if (!delId) return
    setAwards(prev => prev.filter(a => a.id !== delId))
    setDelId(null)
    showToast('Award removed')
  }

  const filtered = filter === 'ALL' ? awards : awards.filter(a => a.award === filter)

  const byRecipient = filtered.reduce<Record<string, AwardEntry[]>>((acc, a) => {
    if (!acc[a.recipient]) acc[a.recipient] = []
    acc[a.recipient].push(a)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-wide">Awards & Commendations</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">NSA Human Resources — Official Recognition Registry</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-600">{awards.length} AWARD{awards.length !== 1 ? 'S' : ''} ON RECORD</span>
          {canEdit && (
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600
                hover:bg-blue-700 text-white text-[12px] font-semibold transition-all
                cursor-pointer border-none">
              <Plus size={13} />
              Grant Award
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(['ALL', ...ALL_AWARD_TYPES] as Array<AwardType | 'ALL'>).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-[0.05em] border transition-all cursor-pointer
              ${filter === t
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-transparent border-[#28304E] text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}>
            {t === 'ALL' ? 'All Awards' : t}
          </button>
        ))}
      </div>

      {/* Awards list */}
      {filtered.length === 0 && (
        <div className="text-center py-16 font-mono text-[11px] text-slate-600">
          NO AWARDS ON RECORD{filter !== 'ALL' ? ' FOR THIS CATEGORY' : ''}
        </div>
      )}

      {Object.entries(byRecipient).map(([recipient, recipientAwards]) => (
        <div key={recipient}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#111627] border border-[#28304E]
              flex items-center justify-center text-[9px] font-bold text-blue-400">
              {recipient[0]}
            </div>
            <span className="font-mono text-[12px] font-bold text-slate-200">{recipient}</span>
            <span className="font-mono text-[10px] text-slate-600">
              — {recipientAwards.length} AWARD{recipientAwards.length !== 1 ? 'S' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 pl-8">
            {recipientAwards.map(award => {
              const meta = AWARD_META[award.award] ?? AWARD_META['Intelligence Commendation Medal']
              const Icon = meta.icon
              return (
                <div key={award.id}
                  className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden hover:border-[#28304E] transition-colors">
                  <div className={`h-1 w-full ${meta.ribbon}`} />
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#111627] border border-[#1E2540]">
                      <Icon size={14} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-[12px] ${meta.color}`}>{award.award}</div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">"{award.citation}"</p>
                      <div className="flex gap-4 mt-2 font-mono text-[9px] text-slate-600">
                        <span>GRANTED: <span className="text-slate-400">{award.date}</span></span>
                        <span>BY: <span className="text-slate-400">{award.grantedBy}</span></span>
                        <span className="text-slate-700">{award.id}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <button onClick={() => setDelId(award.id)}
                        className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer mt-0.5 flex-shrink-0 bg-transparent border-none p-0">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Grant Award modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Grant Award">
        <div className="space-y-4">
          <Field label="Recipient Codename">
            <Input value={fRecipient} onChange={e => setFRecipient(e.target.value.toUpperCase())} placeholder="CODENAME" />
          </Field>
          <Field label="Award">
            <Select value={fAward} onChange={e => setFAward(e.target.value as AwardType)}>
              {ALL_AWARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Citation">
            <textarea
              value={fCitation} onChange={e => setFCitation(e.target.value)}
              placeholder="For exceptional service in..."
              rows={3}
              className="w-full bg-[#111627] border border-[#28304E] rounded-lg px-3 py-2 text-[12px]
                text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors
                font-mono resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
            </Field>
            <Field label="Granted By">
              <Input value={fGranted} onChange={e => setFGranted(e.target.value)} placeholder="Granting authority" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#1E2540] text-slate-400
                text-[12px] transition-all bg-transparent cursor-pointer hover:border-slate-500">
              Cancel
            </button>
            <button onClick={addAward}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                text-[12px] font-semibold transition-all cursor-pointer border-none">
              Record Award
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete modal */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Remove Award?">
        <p className="text-[12px] text-slate-400 mb-5">This will permanently remove the award record. This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDelId(null)}
            className="px-4 py-2 rounded-lg border border-[#1E2540] text-slate-400
              text-[12px] transition-all bg-transparent cursor-pointer hover:border-slate-500">
            Cancel
          </button>
          <button onClick={deleteAward}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white
              text-[12px] font-semibold transition-all cursor-pointer border-none">
            Remove
          </button>
        </div>
      </Modal>
    </div>
  )
}
