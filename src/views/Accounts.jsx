import React, { useState, useEffect } from 'react'
import { UserPlus, Edit2, AlertTriangle, XCircle, CheckCircle, Trash2 } from 'lucide-react'
import { hasPermission } from '../data/auth.js'
import { apiGetUsers, apiCreateUser, apiEditUser, API_BASE, getToken } from '../data/api.js'
import { Pill, Modal, Btn, Field, Input, Select, Badge, showToast } from '../components/UI.jsx'

const RANKS = [
  'Signals Intelligence Analyst',
  'Intelligence Analyst',
  'Senior Intelligence Analyst',
  'Operations Officer',
  'Technical Operations Officer',
  'Cryptologic Technician',
  'Collection Manager',
  'Targeting Officer',
  'Division Chief',
  'Deputy Director',
  'Director',
]
const DEPTS = [
  'Signals Intelligence Directorate',
  'Cybersecurity Directorate',
  'Research Directorate',
  'Operations Directorate',
  'Tailored Access Operations',
  'Special Collections Service',
  'Computer Network Operations',
  'Foreign Affairs Directorate',
  'Technology Directorate',
  'Counterterrorism Mission Management',
  'Counterproliferation Mission Management',
  'Global High Value Targeting',
  'Office of the Inspector General',
  'Command & Control',
]
const CLEARANCES = ['CONFIDENTIAL','SECRET','TS/SCI','TS/SCI + ECI']

function genPass(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function Accounts({ user, accounts, setAccounts }) {
  // Load users from backend on mount
  useEffect(() => {
    apiGetUsers().then(users => setAccounts(users)).catch(() => {})
  }, [])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [creds,    setCreds]    = useState(null)

  // Create form state
  const [newCodename,  setNewCodename]  = useState('')
  const [newRbx,       setNewRbx]       = useState('')
  const [newRank,      setNewRank]      = useState('Intelligence Analyst')
  const [newDept,      setNewDept]      = useState('Signals Intelligence Directorate')
  const [newClearance, setNewClearance] = useState('TS/SCI')
  const [newNotes,     setNewNotes]     = useState('')
  const [newPass,      setNewPass]      = useState('')

  // Edit form state
  const [eCodename,  setECodename]  = useState('')
  const [eRbx,       setERbx]       = useState('')
  const [eRank,      setERank]      = useState('')
  const [eDept,      setEDept]      = useState('')
  const [eClearance, setEClearance] = useState('')
  const [eNotes,     setENotes]     = useState('')

  const canCreate = hasPermission(user, 'acctCreate')
  const canEdit   = hasPermission(user, 'acctEdit')

  const filtered = accounts.filter(a => {
    const matchQ = !search || a.codename.toLowerCase().includes(search.toLowerCase()) ||
      (a.dept || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.rank || '').toLowerCase().includes(search.toLowerCase())
    const matchF = filter === 'all' || a.status === filter
    return matchQ && matchF
  })

  function createAccount() {
    const codename = newCodename.trim().toUpperCase()
    if (!codename || !newRbx.trim()) { showToast('Codename and username required'); return }
    if (accounts.find(a => a.codename === codename)) { showToast('Codename already exists'); return }
    const pass = newPass.trim() || genPass(12)
    const token = genPass(6) + '-' + genPass(6) + '-' + genPass(4)
    apiCreateUser({ codename, pass, role: 'analyst', clearance: newClearance, rank: newRank, dept: newDept, rbx: newRbx.trim(), notes: newNotes }).then(newUser => {
      setAccounts(prev => [...prev, newUser])
      setCreds({ id: newUser.id, pass, token })
      showToast(`Account provisioned: ${codename}`)
    }).catch(e => showToast('Error: ' + e.message))
    setNewCodename(''); setNewRbx(''); setNewNotes(''); setNewPass('')
  }

  function openEdit(a) {
    setEditing(a)
    setECodename(a.codename); setERbx(a.rbx); setERank(a.rank || 'Intelligence Analyst')
    setEDept(a.dept || 'Signals Intelligence Directorate'); setEClearance(a.clearance || 'TS/SCI'); setENotes(a.notes || '')
  }

  function saveEdit() {
    const codename = eCodename.trim().toUpperCase()
    if (!codename) { showToast('Codename required'); return }
    if (accounts.find(a => a.codename === codename && a.id !== editing.id)) { showToast('Codename in use'); return }
    apiEditUser(editing.codename, { codename, rbx: eRbx, rank: eRank, dept: eDept, clearance: eClearance, notes: eNotes }).then(updated => {
      setAccounts(prev => prev.map(a => a.id === editing.id ? updated : a))
      showToast(`Account updated: ${codename}`)
    }).catch(e => showToast('Error: ' + e.message))
    setEditing(null)
  }

  function deleteAccount(id) {
    if (!canEdit) { showToast('ACCESS DENIED — Director+ required'); return }
    const acct = accounts.find(x => x.id === id)
    if (!acct) return
    if (!window.confirm(`Permanently delete account ${acct.codename}? This cannot be undone.`)) return
    fetch(`${API_BASE}/api/users/${encodeURIComponent(acct.codename)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-session-token': getToken() || '' }
    }).then(() => {
      setAccounts(prev => prev.filter(a => a.id !== id))
      showToast(`${acct.codename} — ACCOUNT DELETED`)
    }).catch(() => showToast('Delete failed'))
  }

  function setStatus(id, status) {
    if (!canEdit) { showToast('ACCESS DENIED — Director+ required'); return }
    const acct = accounts.find(x => x.id === id)
    if (!acct) return
    apiEditUser(acct.codename, { status }).then(updated => {
      setAccounts(prev => prev.map(a => a.id === id ? updated : a))
      const labels = { active: 'REINSTATED', suspended: 'SUSPENDED', revoked: 'ACCESS REVOKED' }
      showToast(`${acct.codename} — ${labels[status]}`)
    }).catch(e => showToast('Error: ' + e.message))
  }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Account Management</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">STAFF ACCOUNT PROVISIONING — DIRECTOR ACCESS REQUIRED</p>
        </div>
        {canCreate && (
          <Btn onClick={() => { setCreating(true); setCreds(null) }}>
            <UserPlus size={13} /> Create Account
          </Btn>
        )}
      </div>

      {/* Search/filter */}
      <div className="flex gap-2.5 mb-4">
        <Input placeholder="Search codename, department, rank..." value={search}
          onChange={e => setSearch(e.target.value)} className="flex-1" />
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-36">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-md overflow-hidden mb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Agent','Rank','Department','Clearance','Created','Status',''].map((h, i) => (
                <th key={i} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.07em] border-b border-[#1E2540]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-xs text-slate-600 py-6">No accounts found.</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="hover:bg-[#111627]/40 transition-colors">
                <td className="px-3 py-2.5 border-b border-[#1E2540]">
                  <div className="text-[13px] font-semibold text-slate-100">{a.codename}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">{a.id} · @{a.rbx}</div>
                </td>
                <td className="px-3 py-2.5 border-b border-[#1E2540] text-xs text-slate-300">{a.rank}</td>
                <td className="px-3 py-2.5 border-b border-[#1E2540] text-xs text-slate-300">{a.dept}</td>
                <td className="px-3 py-2.5 border-b border-[#1E2540]">
                  <Badge variant="dim">{a.clearance}</Badge>
                </td>
                <td className="px-3 py-2.5 border-b border-[#1E2540] font-mono text-[10px] text-slate-500">{a.created}</td>
                <td className="px-3 py-2.5 border-b border-[#1E2540]">
                  <Pill variant={a.status === 'active' ? 'active' : a.status === 'suspended' ? 'suspend' : 'revoked'}>
                    {a.status.toUpperCase()}
                  </Pill>
                </td>
                <td className="px-3 py-2.5 border-b border-[#1E2540]">
                  <div className="flex gap-1.5 justify-end">
                    {canEdit && (
                      <button onClick={() => openEdit(a)} title="Edit"
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-950 transition-all">
                        <Edit2 size={12} />
                      </button>
                    )}
                    {canEdit && a.status === 'active' && (
                      <button onClick={() => setStatus(a.id, 'suspended')} title="Suspend"
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-950 transition-all">
                        <AlertTriangle size={12} />
                      </button>
                    )}
                    {canEdit && a.status !== 'active' && (
                      <button onClick={() => setStatus(a.id, 'active')} title="Reinstate"
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-green-500 hover:text-green-400 hover:bg-green-950 transition-all">
                        <CheckCircle size={12} />
                      </button>
                    )}
                    {canEdit && a.status !== 'revoked' && (
                      <button onClick={() => setStatus(a.id, 'revoked')} title="Revoke"
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all">
                        <XCircle size={12} />
                      </button>
                    )}
                    {canEdit && (
                      <button onClick={() => deleteAccount(a.id)} title="Delete Account"
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="font-mono text-[10px] text-slate-600">SHOWING {filtered.length} OF {accounts.length} ACCOUNTS</div>

      {/* Create modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Create Account" sub="PROVISIONING NEW AGENT CREDENTIALS">
        {!creds ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Codename"><Input value={newCodename} onChange={e => setNewCodename(e.target.value.toUpperCase())} placeholder="e.g. VIPER" /></Field>
              <Field label="Roblox Username"><Input value={newRbx} onChange={e => setNewRbx(e.target.value)} placeholder="CoolAgent123" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rank"><Select value={newRank} onChange={e => setNewRank(e.target.value)}>{RANKS.map(r => <option key={r}>{r}</option>)}</Select></Field>
              <Field label="Department"><Select value={newDept} onChange={e => setNewDept(e.target.value)}>{DEPTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
            </div>
            <Field label="Clearance"><Select value={newClearance} onChange={e => setNewClearance(e.target.value)}>{CLEARANCES.map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Notes (optional)"><Input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Sponsor, referral..." /></Field>
            <Field label="Password"><Input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Leave blank to auto-generate" /></Field>
            <div className="flex gap-2.5 mt-2"><Btn onClick={createAccount}>Provision Account</Btn><Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn></div>
          </>
        ) : (
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-md p-4 mt-2">
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Generated Credentials — Copy Now</div>
            {[['Agent ID', creds.id],['Temp Password', creds.pass],['Access Token', creds.token]].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center mb-2 last:mb-0">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.06em]">{l}</span>
                <span className="font-mono text-[12px] text-blue-400">{v}</span>
              </div>
            ))}
            <p className="text-[10px] text-amber-400 mt-3">⚠ Share via secure channel only. Token expires in 24h.</p>
            <div className="flex gap-2.5 mt-4">
              <Btn onClick={() => { setCreating(false); setCreds(null) }}>Done</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Account" sub={editing ? `EDITING — ${editing.id}` : ''}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Codename"><Input value={eCodename} onChange={e => setECodename(e.target.value.toUpperCase())} /></Field>
          <Field label="Roblox Username"><Input value={eRbx} onChange={e => setERbx(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rank"><Select value={eRank} onChange={e => setERank(e.target.value)}>{RANKS.map(r => <option key={r}>{r}</option>)}</Select></Field>
          <Field label="Department"><Select value={eDept} onChange={e => setEDept(e.target.value)}>{DEPTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
        </div>
        <Field label="Clearance"><Select value={eClearance} onChange={e => setEClearance(e.target.value)}>{CLEARANCES.map(c => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Notes"><Input value={eNotes} onChange={e => setENotes(e.target.value)} /></Field>
        {editing && <div className="font-mono text-[10px] text-slate-600 mb-4">ID: {editing.id} · Created: {editing.created} · Status: {editing.status?.toUpperCase()}</div>}
        <div className="flex gap-2.5"><Btn onClick={saveEdit}>Save Changes</Btn><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
