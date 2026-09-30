import React, { useState, useEffect } from 'react'
import { Plus, Edit2, ShieldOff, RefreshCw } from 'lucide-react'
import { Modal, Field, Input, Select, showToast } from '../components/UI'
import { hasPermission, USERS } from '../data/auth'
import { supabase } from '../data/supabase'
import { loadUsers } from '../data/users'
import { logFeedEvent } from '../data/feed'
import type { User } from '../data/auth'

interface AccountsProps {
  user:        User
  accounts:    User[]
  setAccounts: (u: User[]) => void
}

const CLR_OPTIONS = ['UNCLASSIFIED', 'SECRET', 'TS', 'TS/SCI', 'TS/SCI + ECI', 'TS/SCI/SAP']
const ROLE_OPTIONS = ['liaison', 'analyst', 'director', 'admin']

const STATUS_STYLE: Record<string, string> = {
  active:   'text-green-400 bg-green-950/50 border-green-800/50',
  suspend:  'text-amber-400 bg-amber-950/50 border-amber-800/50',
  revoked:  'text-red-400   bg-red-950/50   border-red-800/50',
}

export default function Accounts({ user, accounts, setAccounts }: AccountsProps) {
  const [loading,     setLoading]     = useState(false)
  const [editTarget,  setEditTarget]  = useState<User | null>(null)
  const [createOpen,  setCreateOpen]  = useState(false)

  // Edit state
  const [editRole,      setEditRole]      = useState('')
  const [editClearance, setEditClearance] = useState('')
  const [editStatus,    setEditStatus]    = useState('')

  // Create state
  const [newCodename,   setNewCodename]   = useState('')
  const [newPass,       setNewPass]       = useState('')
  const [newRole,       setNewRole]       = useState('analyst')
  const [newClearance,  setNewClearance]  = useState('SECRET')
  const [newDept,       setNewDept]       = useState('')
  const [newId,         setNewId]         = useState('')

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setLoading(true)
    try {
      const all = await loadUsers()
      setAccounts(all)
    } finally { setLoading(false) }
  }

  if (!hasPermission(user, 'acctView')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <ShieldOff size={32} className="text-red-500/60" />
        <div className="text-red-400 font-mono text-sm tracking-widest">ACCESS DENIED</div>
        <div className="text-slate-600 font-mono text-[11px]">ACCTVIEW PERMISSION REQUIRED</div>
      </div>
    )
  }

  const canCreate = hasPermission(user, 'acctCreate')
  const canEdit   = hasPermission(user, 'acctEdit')
  const list      = accounts.length > 0 ? accounts : USERS

  function openEdit(u: User) {
    setEditTarget(u)
    setEditRole(u.role)
    setEditClearance(u.clearance ?? '')
    setEditStatus(u.status ?? 'active')
  }

  async function handleSave() {
    if (!editTarget) return
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: editRole, clearance: editClearance, status: editStatus })
        .eq('codename', editTarget.codename)
      if (error) throw error
      showToast('Account updated')
      setEditTarget(null)
      refresh()
    } catch (e) {
      showToast('Save failed — ' + (e as Error).message)
    }
  }

  async function handleCreate() {
    if (!newCodename.trim() || !newPass.trim()) {
      showToast('Codename and passphrase required')
      return
    }
    try {
      const { error } = await supabase.from('users').insert({
        id:        newId.trim() || 'NSA-' + Date.now(),
        codename:  newCodename.trim().toUpperCase(),
        pass:      newPass.trim(),
        role:      newRole,
        clearance: newClearance,
        dept:      newDept.trim() || null,
        status:    'active',
      })
      if (error) throw error
      logFeedEvent(`${user.codename} created account: ${newCodename.trim().toUpperCase()} [${newRole}/${newClearance}]`, 'AUTH')
      showToast('Account created — ' + newCodename.toUpperCase())
      setCreateOpen(false)
      setNewCodename(''); setNewPass(''); setNewRole('analyst')
      setNewClearance('SECRET'); setNewDept(''); setNewId('')
      refresh()
    } catch (e) {
      showToast('Create failed — ' + (e as Error).message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-wide">Account Management</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">{list.length} system accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1E2540]
              text-slate-500 hover:text-slate-300 hover:border-slate-500 text-[12px] transition-all
              bg-transparent cursor-pointer disabled:opacity-40">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {canCreate && (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600
                hover:bg-blue-700 text-white text-[12px] font-semibold transition-all
                cursor-pointer border-none">
              <Plus size={13} />
              New Account
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['ID', 'Codename', 'Role', 'Clearance', 'Dept', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {list.map(u => (
              <tr key={u.id} className="hover:bg-[#111627]/60 transition-colors">
                <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px]">{u.id}</td>
                <td className="px-5 py-3.5 font-mono font-semibold text-slate-100">
                  {u.codename}
                  {u.id === user.id && (
                    <span className="ml-2 text-[9px] text-blue-500 font-normal">YOU</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-400 capitalize">{u.role}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-amber-500/80">{u.clearance ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-500 text-[11px]">{u.dept ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold
                    ${STATUS_STYLE[u.status ?? 'active'] ?? STATUS_STYLE.active}`}>
                    {(u.status ?? 'active').toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {canEdit && (
                    <button onClick={() => openEdit(u)}
                      className="p-1.5 rounded border border-[#1E2540] text-slate-500
                        hover:border-blue-500/50 hover:text-blue-400 transition-all
                        bg-transparent cursor-pointer">
                      <Edit2 size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)}
        title={`Edit — ${editTarget?.codename ?? ''}`}>
        {editTarget && (
          <div className="space-y-4">
            <Field label="Role">
              <Select value={editRole} onChange={e => setEditRole(e.target.value)}>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Clearance">
              <Select value={editClearance} onChange={e => setEditClearance(e.target.value)}>
                {CLR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="suspend">Suspended</option>
                <option value="revoked">Revoked</option>
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg border border-[#1E2540] text-slate-400
                  hover:border-slate-500 text-[12px] transition-all bg-transparent cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                  text-[12px] font-semibold transition-all cursor-pointer border-none">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Account">
        <div className="space-y-4">
          <Field label="Codename">
            <Input value={newCodename} onChange={e => setNewCodename(e.target.value.toUpperCase())}
              placeholder="CODENAME" />
          </Field>
          <Field label="Passphrase">
            <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder="Initial passphrase" />
          </Field>
          <Field label="Agent ID">
            <Input value={newId} onChange={e => setNewId(e.target.value)}
              placeholder="NSA-0000 (auto if blank)" />
          </Field>
          <Field label="Role">
            <Select value={newRole} onChange={e => setNewRole(e.target.value)}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Department">
            <Input value={newDept} onChange={e => setNewDept(e.target.value)}
              placeholder="e.g. SIGINT, TAO, SCS" />
          </Field>
          <Field label="Clearance">
            <Select value={newClearance} onChange={e => setNewClearance(e.target.value)}>
              {CLR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#1E2540] text-slate-400
                hover:border-slate-500 text-[12px] transition-all bg-transparent cursor-pointer">
              Cancel
            </button>
            <button onClick={handleCreate}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                text-[12px] font-semibold transition-all cursor-pointer border-none">
              Create Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
