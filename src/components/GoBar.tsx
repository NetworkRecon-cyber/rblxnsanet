import React, { useState, useEffect, useRef } from 'react'
import { Search, LayoutDashboard, Users, MessageSquare, FolderLock, UserCog, Award } from 'lucide-react'
import { hasPermission } from '../data/auth'
import type { User, Perm } from '../data/auth'
import { Badge } from './UI'

interface NavItem {
  key:        string
  name:       string
  desc:       string
  icon:       React.ComponentType<{ size?: number; className?: string }>
  restricted: boolean
  perm:       Perm | null
}

const ALL_ITEMS: NavItem[] = [
  { key: 'overview',  name: 'Overview',              desc: 'Operations dashboard',                     icon: LayoutDashboard, restricted: false, perm: null          },
  { key: 'staff',     name: 'Staff Roster',           desc: 'Personnel directory & status',             icon: Users,           restricted: false, perm: 'staffView'   },
  { key: 'chat',      name: 'Comms',                  desc: 'Secure internal communications',           icon: MessageSquare,   restricted: false, perm: null          },
  { key: 'files',     name: 'File Vault',             desc: 'Classified document repository',           icon: FolderLock,      restricted: false, perm: 'vaultView'   },
  { key: 'accounts',  name: 'Account Management',     desc: 'Staff provisioning & access control',      icon: UserCog,         restricted: false, perm: 'acctView'    },
  { key: 'awards',    name: 'Awards & Commendations', desc: 'Official recognition registry',            icon: Award,           restricted: false, perm: 'awardsView'  },
  // TAO, ANT, SSO, SCS intentionally omitted — URL-only access
]

interface GoBarProps {
  open:         boolean
  onClose:      () => void
  onNavigate:   (key: string) => void
  onRestricted: (key: string) => void
  user:         User
}

export default function GoBar({ open, onClose, onNavigate, onRestricted, user }: GoBarProps) {
  const [q,   setQ]   = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = ALL_ITEMS.filter(item => {
    if (item.perm && !hasPermission(user, item.perm)) return false
    if (!q) return true
    const lq = q.toLowerCase()
    return item.name.toLowerCase().includes(lq)
      || item.desc.toLowerCase().includes(lq)
      || item.key.includes(lq)
  })

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => { setSel(0) }, [q])

  function select(item: NavItem) {
    onClose()
    if (item.restricted) onRestricted(item.key)
    else onNavigate(item.key)
  }

  function onKey(e: React.KeyboardEvent) {
    if      (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter')     { if (items[sel]) select(items[sel]) }
    else if (e.key === 'Escape')    { onClose() }
  }

  if (!open) return null

  const standard   = items.filter(i => !i.restricted)
  const restricted = items.filter(i =>  i.restricted)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[6000] flex items-start justify-center pt-24"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-[500px] max-w-[92vw] bg-[#0C0F1A] border border-[#28304E] rounded-xl overflow-hidden shadow-2xl">

        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E2540]">
          <Search size={15} className="text-blue-500 flex-shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Go to..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-600" />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {standard.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-[0.1em] bg-[#07090F]">Navigation</div>
              {standard.map(item => {
                const Icon = item.icon
                const globalIdx = items.indexOf(item)
                return (
                  <div key={item.key} onClick={() => select(item)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#1E2540] last:border-0
                      ${globalIdx === sel ? 'bg-[#111627]' : 'hover:bg-[#111627]'}`}>
                    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-[#111627]
                      ${globalIdx === sel ? 'text-blue-400' : 'text-slate-500'}`}>
                      <Icon size={13} />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          {restricted.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-[0.1em] bg-[#07090F]">Restricted Access</div>
              {restricted.map(item => {
                const Icon = item.icon
                const globalIdx = items.indexOf(item)
                return (
                  <div key={item.key} onClick={() => select(item)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#1E2540] last:border-0
                      ${globalIdx === sel ? 'bg-[#111627]' : 'hover:bg-[#111627]'}`}>
                    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-[#111627]
                      ${globalIdx === sel ? 'text-blue-400' : 'text-slate-500'}`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <Badge variant="red">ACCESS CODE</Badge>
                  </div>
                )
              })}
            </>
          )}
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-[11px] text-slate-500">No results</div>
          )}
        </div>

        <div className="flex justify-between px-4 py-2 font-mono text-[9px] text-slate-600 border-t border-[#1E2540]">
          <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
        </div>
      </div>
    </div>
  )
}
