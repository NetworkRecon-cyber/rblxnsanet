import React, { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
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
  | 'Cryptologic Achievement Ribbon'
  | 'Collection Support Ribbon'
  | 'Duty Performance Ribbon'
  | 'Technical Proficiency Citation'
  | 'Signals Lead Commendation'
  | 'Meritorious Service Commendation'
  | 'SIGINT Excellence Award'
  | 'Purple Dragon Award'
  | 'Signals Collection Leadership Citation'
  | 'ECHELON Distinguished Service Medal'
  | 'National Intelligence Medal'
  | 'VENONA Citation'
  | "Director's Award"

type Tier = 'I' | 'II' | 'III' | 'IV' | 'V'

interface AwardMeta {
  tier:     Tier
  sublabel: string
  note?:    string
  stripe:   string   // Tailwind bg class for left stripe
  tierBg:   string   // tier badge bg
  tierText: string   // tier badge text
  label:    string   // tier label text
}

const AWARD_META: Record<AwardType, AwardMeta> = {
  'Cryptologic Achievement Ribbon': {
    tier: 'I', sublabel: 'Entry-Level Recognition',
    stripe: 'bg-slate-500', tierBg: 'bg-slate-800', tierText: 'text-slate-300',
    label: 'Tier I',
  },
  'Collection Support Ribbon': {
    tier: 'I', sublabel: 'Entry-Level Recognition',
    stripe: 'bg-slate-500', tierBg: 'bg-slate-800', tierText: 'text-slate-300',
    label: 'Tier I',
  },
  'Duty Performance Ribbon': {
    tier: 'I', sublabel: 'Entry-Level Recognition',
    stripe: 'bg-slate-500', tierBg: 'bg-slate-800', tierText: 'text-slate-300',
    label: 'Tier I',
  },
  'Technical Proficiency Citation': {
    tier: 'I', sublabel: 'Entry-Level Recognition',
    stripe: 'bg-slate-500', tierBg: 'bg-slate-800', tierText: 'text-slate-300',
    label: 'Tier I',
  },
  'Signals Lead Commendation': {
    tier: 'II', sublabel: 'Mid-Grade Commendation',
    stripe: 'bg-blue-500', tierBg: 'bg-blue-950', tierText: 'text-blue-300',
    label: 'Tier II',
  },
  'Meritorious Service Commendation': {
    tier: 'II', sublabel: 'Mid-Grade Commendation',
    stripe: 'bg-blue-500', tierBg: 'bg-blue-950', tierText: 'text-blue-300',
    label: 'Tier II',
  },
  'SIGINT Excellence Award': {
    tier: 'III', sublabel: 'Senior Recognition',
    stripe: 'bg-sky-400', tierBg: 'bg-sky-950', tierText: 'text-sky-300',
    label: 'Tier III',
  },
  'Purple Dragon Award': {
    tier: 'III', sublabel: 'Senior Recognition',
    note: '// Awarded for counterintelligence contributions',
    stripe: 'bg-sky-400', tierBg: 'bg-sky-950', tierText: 'text-sky-300',
    label: 'Tier III',
  },
  'Signals Collection Leadership Citation': {
    tier: 'IV', sublabel: 'Distinguished Service',
    stripe: 'bg-amber-400', tierBg: 'bg-amber-950', tierText: 'text-amber-300',
    label: 'Tier IV',
  },
  'ECHELON Distinguished Service Medal': {
    tier: 'IV', sublabel: 'Distinguished Service',
    note: '// Requires TS/SCI + ECI clearance for nomination',
    stripe: 'bg-amber-400', tierBg: 'bg-amber-950', tierText: 'text-amber-300',
    label: 'Tier IV',
  },
  'National Intelligence Medal': {
    tier: 'IV', sublabel: 'Distinguished Service',
    stripe: 'bg-amber-400', tierBg: 'bg-amber-950', tierText: 'text-amber-300',
    label: 'Tier IV',
  },
  'VENONA Citation': {
    tier: 'V', sublabel: 'Highest Honor',
    note: '// Classification: TS/SCI/SAP — restricted nomination',
    stripe: 'bg-red-500', tierBg: 'bg-red-950', tierText: 'text-red-300',
    label: 'Tier V',
  },
  "Director's Award": {
    tier: 'V', sublabel: 'Highest Honor',
    note: '// Awarded at sole discretion of the Director, NSA',
    stripe: 'bg-red-500', tierBg: 'bg-red-950', tierText: 'text-red-300',
    label: 'Tier V',
  },
}

const ALL_AWARD_TYPES = Object.keys(AWARD_META) as AwardType[]

const TIER_ORDER: Tier[] = ['I', 'II', 'III', 'IV', 'V']
const TIER_LABELS: Record<Tier, string> = {
  I:   'Entry-Level Recognition',
  II:  'Mid-Grade Commendation',
  III: 'Senior Recognition',
  IV:  'Distinguished Service',
  V:   'Highest Honor',
}
const TIER_STRIPE: Record<Tier, string> = {
  I:   'bg-slate-500',
  II:  'bg-blue-500',
  III: 'bg-sky-400',
  IV:  'bg-amber-400',
  V:   'bg-red-500',
}
const TIER_TEXT: Record<Tier, string> = {
  I:   'text-slate-400',
  II:  'text-blue-400',
  III: 'text-sky-400',
  IV:  'text-amber-400',
  V:   'text-red-400',
}
const TIER_BADGE: Record<Tier, string> = {
  I:   'bg-slate-800 text-slate-300',
  II:  'bg-blue-950 text-blue-300',
  III: 'bg-sky-950 text-sky-300',
  IV:  'bg-amber-950 text-amber-300',
  V:   'bg-red-950 text-red-300',
}

function uid()   { return 'AWD-' + Math.random().toString(36).slice(2,9).toUpperCase() }
function today() { return new Date().toISOString().slice(0,10) }

export default function Awards({ user }: { user: User }) {
  const [awards,    setAwards]    = useState<AwardEntry[]>([])
  const [addOpen,   setAddOpen]   = useState(false)
  const [delId,     setDelId]     = useState<string | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(true)

  const [fRecipient, setFRecipient] = useState('')
  const [fAward,     setFAward]     = useState<AwardType>('Cryptologic Achievement Ribbon')
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
    setFAward('Cryptologic Achievement Ribbon'); setFGranted(user.codename)
    showToast('Award recorded')
  }

  function deleteAward() {
    if (!delId) return
    setAwards(prev => prev.filter(a => a.id !== delId))
    setDelId(null)
    showToast('Award removed')
  }

  // Group granted awards by recipient
  const byRecipient = awards.reduce<Record<string, AwardEntry[]>>((acc, a) => {
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

      {/* Award Catalog */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <button
          onClick={() => setCatalogOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 border-b border-[#1E2540]
            hover:bg-[#111627]/40 transition-colors cursor-pointer bg-transparent text-left">
          <span className="text-[12px] font-semibold text-slate-300 tracking-wide">Award Catalog</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600">13 AWARDS · 5 TIERS</span>
            {catalogOpen
              ? <ChevronUp size={13} className="text-slate-600" />
              : <ChevronDown size={13} className="text-slate-600" />
            }
          </div>
        </button>

        {catalogOpen && (
          <div className="divide-y divide-[#1A1F35]">
            {TIER_ORDER.map(tier => {
              const tierAwards = ALL_AWARD_TYPES.filter(a => AWARD_META[a].tier === tier)
              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-[#080B14]">
                    <div className={`w-0.5 h-4 rounded-full ${TIER_STRIPE[tier]}`} />
                    <span className={`text-[10px] font-bold font-mono uppercase tracking-[0.1em] ${TIER_TEXT[tier]}`}>
                      Tier {tier}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">— {TIER_LABELS[tier]}</span>
                  </div>
                  {/* Awards in tier */}
                  {tierAwards.map(awardName => {
                    const meta = AWARD_META[awardName]
                    return (
                      <div key={awardName}
                        className="flex items-stretch hover:bg-[#111627]/40 transition-colors">
                        {/* Colored left stripe */}
                        <div className={`w-1 flex-shrink-0 ${meta.stripe}`} />
                        <div className="flex-1 px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[tier]}`}>
                                  {meta.label}
                                </span>
                              </div>
                              <div className={`text-[14px] font-semibold tracking-wide ${TIER_TEXT[tier]}`}>
                                {awardName}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{meta.sublabel}</div>
                              {meta.note && (
                                <div className="text-[10px] text-slate-700 font-mono mt-1.5 italic">{meta.note}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Awards */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-300 tracking-wide">Active Awards</span>
          <span className="text-[10px] font-mono text-slate-600">{awards.length} GRANTED</span>
        </div>

        {awards.length === 0 && (
          <div className="px-5 py-12 text-center font-mono text-[11px] text-slate-700">
            NO AWARDS ON RECORD
          </div>
        )}

        {Object.entries(byRecipient).map(([recipient, recipientAwards]) => (
          <div key={recipient}>
            {/* Recipient header */}
            <div className="px-5 py-2.5 bg-[#080B14] border-b border-[#1A1F35] flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#111627] border border-[#28304E]
                flex items-center justify-center text-[9px] font-bold text-blue-400">
                {recipient[0]}
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-200 tracking-wide">{recipient}</span>
              <span className="font-mono text-[10px] text-slate-600 ml-1">
                {recipientAwards.length} AWARD{recipientAwards.length !== 1 ? 'S' : ''}
              </span>
            </div>

            {recipientAwards.map(award => {
              const meta = AWARD_META[award.award]
              const tier = meta?.tier ?? 'I'
              return (
                <div key={award.id}
                  className="flex items-stretch hover:bg-[#111627]/40 transition-colors border-b border-[#1A1F35] last:border-b-0 group">
                  <div className={`w-1 flex-shrink-0 ${TIER_STRIPE[tier]}`} />
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[tier]}`}>
                            {meta?.label ?? 'Tier I'}
                          </span>
                        </div>
                        <div className={`text-[13px] font-semibold ${TIER_TEXT[tier]}`}>{award.award}</div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed italic">"{award.citation}"</p>
                        <div className="flex gap-4 mt-2 font-mono text-[9px] text-slate-600">
                          <span>GRANTED <span className="text-slate-500">{award.date}</span></span>
                          <span>BY <span className="text-slate-500">{award.grantedBy}</span></span>
                          <span className="text-slate-700">{award.id}</span>
                        </div>
                      </div>
                      {canEdit && (
                        <button onClick={() => setDelId(award.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400
                            transition-all cursor-pointer flex-shrink-0 mt-0.5 bg-transparent border-none p-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Grant Award modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Grant Award">
        <div className="space-y-4">
          <Field label="Recipient Codename">
            <Input value={fRecipient} onChange={e => setFRecipient(e.target.value.toUpperCase())} placeholder="CODENAME" />
          </Field>
          <Field label="Award">
            <Select value={fAward} onChange={e => setFAward(e.target.value as AwardType)}>
              {TIER_ORDER.map(tier => {
                const tierAwards = ALL_AWARD_TYPES.filter(a => AWARD_META[a].tier === tier)
                return (
                  <optgroup key={tier} label={`── Tier ${tier}: ${TIER_LABELS[tier]}`}>
                    {tierAwards.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                )
              })}
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
