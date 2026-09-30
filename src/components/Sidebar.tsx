import React from 'react'
import {
  LayoutDashboard, Users, MessageSquare, FolderLock,
  UserCog, BookOpen, Award, Radio, BarChart2, Globe, Lock
} from 'lucide-react'
import { hasPermission } from '../data/auth'
import type { User, Perm } from '../data/auth'

interface NavItem {
  key:        string
  label:      string
  icon:       React.ComponentType<{ size?: number; className?: string }>
  perm:       Perm | null
  restricted: boolean
  section?:   string
}

const NAV: NavItem[] = [
  { key: 'overview',  label: 'Overview',      icon: LayoutDashboard, perm: null,         restricted: false, section: 'MAIN' },
  { key: 'staff',     label: 'Staff',          icon: Users,           perm: 'staffView',  restricted: false },
  { key: 'chat',      label: 'Comms',          icon: MessageSquare,   perm: null,         restricted: false },
  { key: 'files',     label: 'File Vault',     icon: FolderLock,      perm: 'vaultView',  restricted: false },
  { key: 'accounts',  label: 'Accounts',       icon: UserCog,         perm: 'acctView',   restricted: false },
  { key: 'awards',    label: 'Awards',         icon: Award,           perm: 'awardsView', restricted: false },
  { key: 'ant',       label: 'ANT Catalog',    icon: BookOpen,        perm: 'antView',    restricted: false, section: 'RESTRICTED' },
  { key: 'tao',       label: 'TAO',            icon: Globe,           perm: null,         restricted: true  },
  { key: 'analytics', label: 'Analytics',      icon: BarChart2,       perm: null,         restricted: true  },
  { key: 'scs',       label: 'SCS',            icon: Radio,           perm: null,         restricted: true  },
]

interface SidebarProps {
  user:         User
  active:       string
  onNavigate:   (key: string) => void
  onRestricted: (key: string) => void
}

export default function Sidebar({ user, active, onNavigate, onRestricted }: SidebarProps) {
  let lastSection = ''

  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#0A0D16] border-r border-[#1A1F35] flex flex-col overflow-y-auto">
      <div className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(item => {
          // Permission check
          if (item.perm && !hasPermission(user, item.perm)) return null

          const Icon = item.icon
          const isActive = active === item.key
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          function click() {
            if (item.restricted) onRestricted(item.key)
            else onNavigate(item.key)
          }

          return (
            <React.Fragment key={item.key}>
              {showSection && (
                <div className="px-3 pt-4 pb-1 text-[9px] font-bold text-slate-600 uppercase tracking-[0.12em]">
                  {item.section}
                </div>
              )}
              <button
                onClick={click}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left
                  transition-all text-[12px] font-medium cursor-pointer border-none
                  ${isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-600/30'
                    : item.restricted
                      ? 'text-slate-500 hover:bg-[#111627] hover:text-amber-400'
                      : 'text-slate-400 hover:bg-[#111627] hover:text-slate-100'
                  }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-400' : item.restricted ? 'text-amber-600' : 'text-slate-500'} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.restricted && (
                  <Lock size={9} className="text-amber-700 flex-shrink-0" />
                )}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      {/* Bottom info */}
      <div className="px-3 py-3 border-t border-[#1A1F35]">
        <div className="text-[9px] font-mono text-slate-700 leading-relaxed">
          <div>{user.codename}</div>
          <div className="text-amber-800">{user.clearance}</div>
        </div>
      </div>
    </aside>
  )
}
