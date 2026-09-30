import React, { useState } from 'react'
import { Send, Plus, Lock } from 'lucide-react'
import { Modal, Field, Input, Select, Textarea, showToast } from '../components/UI'
import { hasPermission } from '../data/auth'
import type { User } from '../data/auth'

interface CommsProps { user: User }

interface Thread {
  id:             string
  from:           string
  subject:        string
  time:           string
  body:           string
  classification: string
}

const THREADS: Thread[] = [
  { id: 't1', from: 'DIRECTOR', subject: 'OPERATION NIGHTFALL — BRIEF',    time: '14:31Z', classification: 'TS//SCI',     body: 'NIGHTFALL assets are in position. Confirm surveillance window opens 0200 local.\n\nAll comms to go dark after 2300. Use PRISM relay only.\n\nDO NOT contact field team directly. Route through CIPHER.\n\n— DIRECTOR' },
  { id: 't2', from: 'CIPHER',   subject: 'RE: SIGINT COLLECTION BATCH 7',  time: '13:58Z', classification: 'TS//SCI',     body: 'Batch 7 processed. 14,203 intercepts filtered. Flagged 47 for analyst review.\n\nSending to VAULT partition SIGMA-7. Access code transmitted via separate channel.\n\n— CIPHER' },
  { id: 't3', from: 'WRAITH',   subject: 'IMPLANT STATUS — NODE 4',        time: '13:22Z', classification: 'TS//SI//REL', body: 'Node 4 implant operational. Exfil rate 2.3GB/day. Target unaware.\n\nSuggesting expansion to nodes 5 and 6 before window closes.\n\nAwaiting authorization.\n\n— WRAITH' },
  { id: 't4', from: 'ORACLE',   subject: 'CRYPTANALYSIS REPORT — WEEKLY',  time: '09:14Z', classification: 'TS//SCI',     body: 'Weekly cryptanalysis summary attached.\n\nNotable: adversary rotated keys on schedule — expected. New algorithm variant observed in subnet 192.x traffic. Prelim analysis suggests modified AES-128 with custom IV scheme.\n\nFull report in VAULT: CRYPTO_WEEKLY_2024_11.pdf\n\n— ORACLE' },
  { id: 't5', from: 'PHANTOM',  subject: 'SCS SITE ALPHA — MAINTENANCE',   time: 'YEST',   classification: 'TS//SI//TK',  body: 'Scheduled maintenance for SITE ALPHA (Embassy Row) — 2024-03-17 0000-0400 local.\n\nCollection will be interrupted during this window. Notify collection management.\n\nSite tech en route. ETA 2300.\n\n— PHANTOM' },
]

export default function Comms({ user }: CommsProps) {
  const [selected,   setSelected]   = useState<Thread>(THREADS[0])
  const [modalOpen,  setModalOpen]  = useState(false)
  const [to,         setTo]         = useState('')
  const [subject,    setSubject]    = useState('')
  const [body,       setBody]       = useState('')
  const [classLevel, setClassLevel] = useState('TS//SCI')

  const canSend = hasPermission(user, 'chatSend')

  function handleSend() {
    if (!to.trim() || !subject.trim()) { showToast('Recipient and subject required.'); return }
    showToast('Message sent — encrypted')
    setModalOpen(false); setTo(''); setSubject(''); setBody('')
  }

  return (
    <div className="h-full flex gap-0 max-w-5xl mx-auto w-full">

      {/* Thread list */}
      <div className="w-72 flex-shrink-0 border-r border-[#1E2540] flex flex-col">
        <div className="px-4 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-300">Secure Comms</span>
          {canSend && (
            <button onClick={() => setModalOpen(true)}
              className="p-1.5 rounded border border-[#1E2540] text-slate-500
                hover:border-blue-500/50 hover:text-blue-400 transition-all
                bg-transparent cursor-pointer">
              <Plus size={12} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#1A1F35]">
          {THREADS.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`w-full text-left px-4 py-3 transition-colors cursor-pointer border-none
                ${selected.id === t.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-[#111627]/60'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-slate-300">{t.from}</span>
                <span className="font-mono text-[10px] text-slate-600">{t.time}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">{t.subject}</div>
              <div className="mt-1">
                <span className="text-[9px] font-mono text-red-500/70">{t.classification}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E2540]">
          <div className="text-[13px] font-semibold text-slate-100 mb-1">{selected.subject}</div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-mono text-slate-500">FROM: <span className="text-slate-300">{selected.from}</span></span>
            <span className="text-slate-700">·</span>
            <span className="font-mono text-slate-600">{selected.time}</span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1">
              <Lock size={10} className="text-red-500/70" />
              <span className="font-mono text-[10px] text-red-500/70">{selected.classification}</span>
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="font-mono text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed">
            {selected.body}
          </pre>
        </div>
        {canSend && (
          <div className="px-6 py-3 border-t border-[#1E2540]">
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10
                border border-blue-600/30 text-blue-400 text-[12px] font-semibold
                hover:bg-blue-600/20 transition-all cursor-pointer">
              <Send size={12} />
              Compose New Message
            </button>
          </div>
        )}
      </div>

      {/* Compose modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Compose Secure Message">
        <div className="space-y-4">
          <Field label="To (codename)">
            <Input value={to} onChange={e => setTo(e.target.value.toUpperCase())} placeholder="CODENAME" />
          </Field>
          <Field label="Subject">
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" />
          </Field>
          <Field label="Classification">
            <Select value={classLevel} onChange={e => setClassLevel(e.target.value)}>
              <option>UNCLASSIFIED</option>
              <option>SECRET</option>
              <option>TS//SCI</option>
              <option>TS//SI//REL</option>
            </Select>
          </Field>
          <Field label="Message">
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Encrypted message body..." />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#1E2540] text-slate-400
                text-[12px] transition-all bg-transparent cursor-pointer hover:border-slate-500">
              Cancel
            </button>
            <button onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600
                hover:bg-blue-700 text-white text-[12px] font-semibold transition-all
                cursor-pointer border-none">
              <Send size={12} />
              Send Encrypted
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
