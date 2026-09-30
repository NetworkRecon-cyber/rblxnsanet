import React, { useState, useEffect } from 'react'
import { Search, Shield, Radio, Cpu, Eye, Lock, Wifi } from 'lucide-react'
import { Card, CardHead, Badge, Pill } from '../components/UI'

// ── Types ──
interface ANTEntry {
  id:          string
  name:        string
  codename:    string
  category:    Category
  status:      'ACTIVE' | 'DEPRECATED' | 'DEVELOPMENTAL'
  clearance:   string
  description: string
  targets:     string[]
  agency:      string
}

type Category = 'RF' | 'NETWORK' | 'HARDWARE' | 'SOFTWARE' | 'COLLECTION' | 'EXPLOITATION'

// ── Static catalog entries (NSA ANT catalog — declassified 2013) ──
const CATALOG: ANTEntry[] = [
  {
    id: 'ANT-001', name: 'CANDYGRAM', codename: 'CANDYGRAM', category: 'RF',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'GSM base station simulator. Emulates a legitimate cellular tower to intercept mobile communications and track device location.',
    targets: ['Mobile devices', 'GSM networks', 'IMSI collection'],
  },
  {
    id: 'ANT-002', name: 'COTTONMOUTH', codename: 'COTTONMOUTH-I', category: 'HARDWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'USB hardware implant with active RF transceiver. Provides covert wireless bridge into air-gapped networks via USB host or device connections.',
    targets: ['Air-gapped systems', 'USB peripherals'],
  },
  {
    id: 'ANT-003', name: 'DROPOUT JEEP', codename: 'DROPOUT JEEP', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Software implant for Apple iOS. Enables remote push/pull of files, SMS retrieval, voicemail, geolocation, microphone activation, and camera capture.',
    targets: ['Apple iOS', 'iPhone'],
  },
  {
    id: 'ANT-004', name: 'FIREWALK', codename: 'FIREWALK', category: 'HARDWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Active gigabit Ethernet implant disguised as a standard RJ45 socket. Injects and collects packets on a local Ethernet network via RF.',
    targets: ['LAN infrastructure', 'Ethernet switches'],
  },
  {
    id: 'ANT-005', name: 'HEADWATER', codename: 'HEADWATER', category: 'HARDWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Persistent backdoor implant for Huawei routers. Installed in read-only memory; survives firmware updates and factory resets.',
    targets: ['Huawei routers', 'Network infrastructure'],
  },
  {
    id: 'ANT-006', name: 'IRATEMONK', codename: 'IRATEMONK', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Firmware persistence implant for hard drive firmware (Western Digital, Seagate, Samsung, Maxtor). Survives full disk wipes and OS reinstalls.',
    targets: ['HDD firmware', 'Workstations', 'Servers'],
  },
  {
    id: 'ANT-007', name: 'JETPLOW', codename: 'JETPLOW', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Firmware backdoor for Cisco PIX and ASA firewalls. Persists in flash memory, enabling remote access even after device power-cycle.',
    targets: ['Cisco PIX', 'Cisco ASA', 'Firewall infrastructure'],
  },
  {
    id: 'ANT-008', name: 'MONKEYCALENDAR', codename: 'MONKEYCALENDAR', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Exfiltrates geolocation data from mobile phone via hidden SMS messages. Target device transmits location silently without user knowledge.',
    targets: ['Mobile devices', 'Location tracking'],
  },
  {
    id: 'ANT-009', name: 'NIGHTSTAND', codename: 'NIGHTSTAND', category: 'RF',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Portable system that injects IEEE 802.11 WiFi packets into a target network. Can exploit vulnerable Windows machines from up to 8 miles away.',
    targets: ['WiFi networks', 'Windows systems', '802.11'],
  },
  {
    id: 'ANT-010', name: 'PICASSO', codename: 'PICASSO', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Modified mobile phone firmware. Collects user data, geolocation, and activates microphone. Communicates via covert SMS channel.',
    targets: ['Feature phones', 'GSM devices'],
  },
  {
    id: 'ANT-011', name: 'RAGEMASTER', codename: 'RAGEMASTER', category: 'HARDWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Concealed implant in VGA cable ferrite. Captures monitor display content by retransmitting VGA red-channel signal via RF for remote collection.',
    targets: ['Monitor cables', 'Display interception'],
  },
  {
    id: 'ANT-012', name: 'SOMBERKNAVE', codename: 'SOMBERKNAVE', category: 'SOFTWARE',
    status: 'DEVELOPMENTAL', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Windows XP implant that covertly uses an idle 802.11 wireless device to communicate with external operators, bypassing wired network monitoring.',
    targets: ['Windows XP', 'Air-gapped networks'],
  },
  {
    id: 'ANT-013', name: 'SURLYSPAWN', codename: 'SURLYSPAWN', category: 'HARDWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Hardware keylogger retrofit for PS/2 and USB keyboards. Transmits keystrokes via RF to a nearby collection receiver.',
    targets: ['PS/2 keyboards', 'USB keyboards'],
  },
  {
    id: 'ANT-014', name: 'TOTEGHOSTLY', codename: 'TOTEGHOSTLY 2.0', category: 'SOFTWARE',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'BIOS-level implant for Windows Mobile phones. Provides full remote access including call logs, SMS, contacts, and real-time location.',
    targets: ['Windows Mobile', 'Smartphones'],
  },
  {
    id: 'ANT-015', name: 'WATERWITCH', codename: 'WATERWITCH', category: 'COLLECTION',
    status: 'ACTIVE', clearance: 'TS/SCI', agency: 'NSA/TAO',
    description: 'Handheld finishing tool for geolocating target handsets. Works in conjunction with active implants to narrow location to meter-level accuracy.',
    targets: ['Mobile handsets', 'Geolocation finisher'],
  },
]

const CATEGORY_META: Record<Category, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  RF:          { icon: Radio,  color: 'text-purple-400', bg: 'bg-purple-950 border-purple-700' },
  NETWORK:     { icon: Wifi,   color: 'text-blue-400',   bg: 'bg-blue-950 border-blue-700'   },
  HARDWARE:    { icon: Cpu,    color: 'text-amber-400',  bg: 'bg-amber-950 border-amber-700' },
  SOFTWARE:    { icon: Lock,   color: 'text-green-400',  bg: 'bg-green-950 border-green-700' },
  COLLECTION:  { icon: Eye,    color: 'text-cyan-400',   bg: 'bg-cyan-950 border-cyan-700'   },
  EXPLOITATION:{ icon: Shield, color: 'text-red-400',    bg: 'bg-red-950 border-red-700'     },
}

const STATUS_COLORS: Record<ANTEntry['status'], string> = {
  ACTIVE:        'text-green-400 bg-green-950 border-green-700',
  DEPRECATED:    'text-slate-400 bg-slate-800 border-slate-600',
  DEVELOPMENTAL: 'text-amber-400 bg-amber-950 border-amber-700',
}

const CATEGORIES: Array<Category | 'ALL'> = ['ALL', 'RF', 'NETWORK', 'HARDWARE', 'SOFTWARE', 'COLLECTION', 'EXPLOITATION']

export default function ANTCatalog() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState<Category | 'ALL'>('ALL')
  const [selected, setSelected] = useState<ANTEntry | null>(null)

  const filtered = CATALOG.filter(e => {
    const matchCat = category === 'ALL' || e.category === category
    const q = query.toLowerCase()
    const matchQ = !q || e.name.toLowerCase().includes(q)
      || e.codename.toLowerCase().includes(q)
      || e.description.toLowerCase().includes(q)
      || e.targets.some(t => t.toLowerCase().includes(q))
    return matchCat && matchQ
  })

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">ANT Catalog</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1 tracking-[0.04em]">
            NSA/TAO // TAILORED ACCESS OPERATIONS — PRODUCT CATALOG // TOP SECRET//SCI
          </p>
        </div>
        <div className="font-mono text-[10px] text-slate-600 text-right">
          {CATALOG.length} ENTRIES INDEXED<br />
          <span className="text-slate-700">SOURCE: ANT DIV // DECLASSIFIED 2013</span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools, codenames, targets..."
            className="w-full bg-[#0C0F1A] border border-[#1E2540] rounded px-3 py-2 pl-8
              text-[12px] text-slate-200 placeholder-slate-600 outline-none
              focus:border-blue-600 transition-colors font-mono"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1.5 rounded text-[10px] font-semibold uppercase tracking-[0.06em] border transition-all cursor-pointer
                ${category === cat
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-[#28304E] text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="font-mono text-[10px] text-slate-600 mb-3">
        {filtered.length} RECORD{filtered.length !== 1 ? 'S' : ''} RETURNED
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-2">
        {filtered.map(entry => {
          const meta = CATEGORY_META[entry.category]
          const Icon = meta.icon
          return (
            <div
              key={entry.id}
              onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
              className={`bg-[#0C0F1A] border rounded-lg cursor-pointer transition-all
                ${selected?.id === entry.id
                  ? 'border-blue-600 shadow-[0_0_16px_rgba(63,111,232,0.15)]'
                  : 'border-[#1E2540] hover:border-[#28304E]'}`}
            >
              {/* Row */}
              <div className="flex items-center gap-4 px-4 py-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border ${meta.bg}`}>
                  <Icon size={14} className={meta.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-slate-100">{entry.codename}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-[0.06em] ${STATUS_COLORS[entry.status]}`}>
                      {entry.status}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5 truncate">
                    {entry.id} // {entry.category} // {entry.agency}
                  </div>
                </div>

                <div className="hidden md:flex gap-1.5 flex-wrap justify-end max-w-[280px]">
                  {entry.targets.slice(0, 2).map(t => (
                    <span key={t} className="font-mono text-[9px] text-slate-500 bg-[#111627] border border-[#1E2540] px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                  {entry.targets.length > 2 && (
                    <span className="font-mono text-[9px] text-slate-600">+{entry.targets.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {selected?.id === entry.id && (
                <div className="border-t border-[#1E2540] px-4 py-4">
                  <p className="text-[12px] text-slate-300 leading-relaxed mb-3">{entry.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-[0.06em] mr-1">TARGETS:</span>
                    {entry.targets.map(t => (
                      <span key={t} className="font-mono text-[9px] text-blue-400 bg-blue-950 border border-blue-800 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 font-mono text-[9px] text-slate-600">
                    <span>CLEARANCE: <span className="text-amber-400">{entry.clearance}</span></span>
                    <span>DIVISION: <span className="text-slate-400">{entry.agency}</span></span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600 font-mono text-[11px]">
            NO RECORDS MATCH QUERY
          </div>
        )}
      </div>
    </div>
  )
}
