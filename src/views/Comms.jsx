import React, { useState, useRef, useEffect } from 'react'
import { Plus, Send } from 'lucide-react'
import { Modal, Btn, Field, Input, Select } from '../components/UI.jsx'
import { apiGetComms, apiSaveComms, apiSendMessage } from '../data/api.js'
import { ROLE_RANK, hasPermission } from '../data/auth.js'

const DEFAULT_CHANNELS = [
  { id: 'general',    name: 'general',    desc: 'General discussion',       access: 'all'      },
  { id: 'ops',        name: 'ops',        desc: 'Operational briefings',    access: 'analyst'  },
  { id: 'intel',      name: 'intel',      desc: 'Intelligence reports',     access: 'analyst'  },
  { id: 'alerts',     name: 'alerts',     desc: 'System alerts',            access: 'director' },
  { id: 'leadership', name: 'leadership', desc: 'Director-level only',      access: 'director' },
]

function canAccessChannel(user, ch) {
  const rank = ROLE_RANK[user?.role] ?? 0
  const req  = { all: 0, analyst: 1, director: 2, admin: 3 }[ch.access] ?? 0
  return rank >= req
}

export default function Comms({ user }) {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS)
  const [history,  setHistory]  = useState({})
  const [room,     setRoom]     = useState('general')

  // Load from backend on mount
  useEffect(() => {
    apiGetComms().then(d => {
      if (d.channels && d.channels.length) setChannels(d.channels)
      if (d.messages) setHistory(d.messages)
    }).catch(() => {})
  }, [])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const t = setInterval(() => {
      apiGetComms().then(d => {
        if (d.messages) setHistory(d.messages)
      }).catch(() => {})
    }, 5000)
    return () => clearInterval(t)
  }, [])
  const [input,    setInput]    = useState('')
  const [newModal, setNewModal] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newDesc,  setNewDesc]  = useState('')
  const [newAccess,setNewAccess]= useState('all')
  const msgRef = useRef(null)
  const canSend = hasPermission(user, 'chatSend')
  const visible = channels.filter(ch => canAccessChannel(user, ch))

  useEffect(() => { msgRef.current?.scrollTo(0, msgRef.current.scrollHeight) }, [history, room])

  function utc() {
    const n = new Date()
    return [n.getUTCHours(), n.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
  }

  function sendMsg() {
    const txt = input.trim()
    if (!txt || !canSend) return
    setInput('')
    apiSendMessage(room, txt).then(msg => {
      setHistory(h => ({ ...h, [room]: [...(h[room] || []), msg] }))
    }).catch(() => {
      // Fallback to local if backend unreachable
      const msg = { id: Date.now(), user: user?.codename || 'AGENT', role: 'mod', text: txt, time: utc() }
      setHistory(h => ({ ...h, [room]: [...(h[room] || []), msg] }))
    })
  }

  function createChannel() {
    const name = newName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!name || channels.find(c => c.id === name)) return
    const newChs = [...channels, { id: name, name, desc: newDesc || 'No description', access: newAccess }]
    setChannels(newChs)
    apiGetComms().then(d => {
      apiSaveComms({ ...d, channels: newChs }).catch(() => {})
    }).catch(() => {})
    setNewModal(false)
    setNewName(''); setNewDesc(''); setNewAccess('all')
  }

  const msgs = history[room] || []
  const currentCh = channels.find(c => c.id === room)

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Sidebar */}
      <div className="w-48 bg-[#0C0F1A] border-r border-[#1E2540] flex flex-col py-3 flex-shrink-0">
        <div className="flex items-center justify-between px-3.5 mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">Channels</span>
          {hasPermission(user, 'chatSend') && (
            <button onClick={() => setNewModal(true)}
              className="w-5 h-5 flex items-center justify-center rounded border border-[#1E2540]
                text-slate-600 hover:text-blue-400 hover:border-blue-600 transition-all">
              <Plus size={11} />
            </button>
          )}
        </div>

        {visible.map(ch => (
          <button key={ch.id} onClick={() => setRoom(ch.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors
              border-l-2 w-full cursor-pointer
              ${room === ch.id
                ? 'bg-blue-950/40 text-blue-400 border-blue-600'
                : 'text-slate-400 border-transparent hover:bg-[#111627] hover:text-slate-200'}`}>
            <span className="text-slate-600 font-semibold">#</span>
            {ch.name}
          </button>
        ))}

        <div className="px-3.5 mt-4 mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">Direct</span>
        </div>
        <div className="px-3.5 text-[11px] text-slate-600">No direct messages</div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-11 border-b border-[#1E2540] flex items-center px-5 gap-2.5 flex-shrink-0">
          <span className="text-slate-500 text-base font-semibold">#</span>
          <span className="text-[14px] font-semibold text-slate-100">{room}</span>
          {currentCh && (
            <span className="text-[11px] text-slate-500 border-l border-[#1E2540] pl-2.5">{currentCh.desc}</span>
          )}
        </div>

        <div ref={msgRef} className="flex-1 overflow-y-auto p-5">
          {msgs.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-10">No messages yet. Be the first to send one.</div>
          ) : (
            msgs.map((m, i) => (
              <div key={i} className="flex gap-3 mb-3.5">
                <div className="w-8 h-8 rounded bg-blue-950 border border-blue-800/30 flex items-center justify-center
                  text-xs font-bold text-blue-400 flex-shrink-0">
                  {m.user.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className={`text-[13px] font-semibold ${m.role === 'op' ? 'text-amber-400' : 'text-blue-400'}`}>{m.user}</span>
                    <span className="font-mono text-[10px] text-slate-600">{m.time}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">{m.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3.5 border-t border-[#1E2540] flex-shrink-0">
          <div className="flex gap-2 items-center">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              disabled={!canSend}
              placeholder={canSend ? `Message #${room}...` : 'Read-only — Analyst+ required'}
              className="flex-1 bg-[#111627] border border-[#28304E] rounded text-sm text-slate-100
                px-3.5 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2
                focus:ring-blue-500/10 placeholder-slate-600 disabled:opacity-40 disabled:cursor-not-allowed" />
            <button onClick={sendMsg} disabled={!canSend}
              className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded
                hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* New channel modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Channel" sub="CREATE SECURE COMMUNICATIONS CHANNEL">
        <Field label="Channel Name">
          <div className="flex">
            <div className="bg-[#111627] border border-[#28304E] border-r-0 rounded-l px-2.5 flex items-center text-slate-500 text-sm">#</div>
            <Input value={newName} onChange={e => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g,''))}
              placeholder="channel-name" className="rounded-l-none" onKeyDown={e => e.key === 'Enter' && createChannel()} />
          </div>
        </Field>
        <Field label="Description">
          <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this channel for?" />
        </Field>
        <Field label="Access Level">
          <Select value={newAccess} onChange={e => setNewAccess(e.target.value)}>
            <option value="all">All Staff</option>
            <option value="analyst">Analyst+</option>
            <option value="director">Director+</option>
            <option value="admin">Sysadmin Only</option>
          </Select>
        </Field>
        <div className="flex gap-2.5 mt-2">
          <Btn onClick={createChannel}>Create Channel</Btn>
          <Btn variant="ghost" onClick={() => setNewModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
