import React from 'react'
import { AlertOctagon, Globe, Cpu, Wifi, Activity } from 'lucide-react'
import type { User } from '../data/auth'

interface CollectionSite {
  id:       string
  location: string
  cover:    string
  status:   'OPERATIONAL' | 'MAINTENANCE' | 'BURNED'
  dailyVol: string
  since:    string
}

interface Implant {
  id:          string
  target:      string
  type:        string
  status:      'ACTIVE' | 'DORMANT' | 'LOST'
  lastContact: string
}

const SITES: CollectionSite[] = [
  { id: 'SCS-01', location: 'MOSCOW, RU',   cover: 'US Embassy — Political Section',   status: 'OPERATIONAL', dailyVol: '38 GB', since: '2018-04-01' },
  { id: 'SCS-02', location: 'BEIJING, CN',  cover: 'US Embassy — Economic Attaché',   status: 'OPERATIONAL', dailyVol: '51 GB', since: '2017-09-12' },
  { id: 'SCS-03', location: 'BERLIN, DE',   cover: 'US Consulate — Cultural Affairs', status: 'MAINTENANCE', dailyVol: '0 GB',  since: '2019-03-03' },
  { id: 'SCS-04', location: 'TEHRAN, IR',   cover: 'Third-party relay station',       status: 'OPERATIONAL', dailyVol: '22 GB', since: '2021-06-17' },
  { id: 'SCS-05', location: 'PYONGYANG, KP',cover: 'Diplomatic support facility',     status: 'BURNED',      dailyVol: '0 GB',  since: '2022-11-30' },
]

const IMPLANTS: Implant[] = [
  { id: 'IMP-8821', target: 'Kremlin Subnet A',      type: 'TURBINE/SECONDDATE', status: 'ACTIVE',  lastContact: '2m ago'     },
  { id: 'IMP-4412', target: 'PLA Backbone Node 7',   type: 'FOXACID',            status: 'ACTIVE',  lastContact: '14m ago'    },
  { id: 'IMP-9033', target: 'IRGC Comms Router',     type: 'QUANTUM INSERT',     status: 'DORMANT', lastContact: '6h ago'     },
  { id: 'IMP-1105', target: 'NK Telecom Exchange',   type: 'DROPOUT JEEP',       status: 'LOST',    lastContact: '14 days ago'},
  { id: 'IMP-6677', target: 'SVR C2 Infrastructure', type: 'BYZANTINE HADES',    status: 'ACTIVE',  lastContact: '1m ago'     },
  { id: 'IMP-2290', target: 'FSB Internal Network',  type: 'TURBINE',            status: 'ACTIVE',  lastContact: '8m ago'     },
]

const SITE_STYLE: Record<string, string> = {
  OPERATIONAL: 'text-green-400 bg-green-950/50 border-green-800/50',
  MAINTENANCE: 'text-slate-400 bg-slate-900/50 border-slate-700/50',
  BURNED:      'text-red-400   bg-red-950/50   border-red-800/50',
}

const IMP_STYLE: Record<string, string> = {
  ACTIVE:  'text-green-400 bg-green-950/50 border-green-800/50',
  DORMANT: 'text-slate-400 bg-slate-900/50 border-slate-700/50',
  LOST:    'text-red-400   bg-red-950/50   border-red-800/50',
}

export const SCS: React.FC<{ user: User }> = ({ user }) => {
  const activeSites    = SITES.filter(s => s.status === 'OPERATIONAL').length
  const activeImplants = IMPLANTS.filter(i => i.status === 'ACTIVE').length
  const totalVol       = SITES.filter(s => s.status === 'OPERATIONAL').reduce((a, s) => a + parseFloat(s.dailyVol), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Restricted banner */}
      <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 rounded-xl px-5 py-3.5">
        <AlertOctagon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-red-400 font-mono text-[11px] font-bold tracking-widest">RESTRICTED — SCS/CNO ACCESS ONLY</div>
          <div className="text-red-500/60 font-mono text-[10px] mt-0.5">
            SPECIAL COLLECTION SERVICE // COMPUTER NETWORK OPERATIONS // TS//SI//TK//NOFORN
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-100 tracking-wide">SCS / CNO Operations</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Operator: <span className="font-mono text-blue-400">{user.codename}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Sites',         value: `${activeSites}/5`,        icon: Globe, color: 'text-blue-400',  border: 'border-blue-500/20',  bg: 'bg-blue-500/8'  },
          { label: 'Daily Collection Vol', value: `${totalVol} GB`,           icon: Wifi,  color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/8' },
          { label: 'Active Implants',      value: activeImplants.toString(),  icon: Cpu,   color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/8' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SCS Sites */}
        <div className="bg-[#0C0F1A] border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-300">Embassy Collection Sites</span>
            <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/40 border border-blue-800/50 px-2 py-0.5 rounded">SCS</span>
          </div>
          <div className="divide-y divide-[#1A1F35]">
            {SITES.map(site => (
              <div key={site.id} className="px-5 py-3 hover:bg-[#111627]/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-slate-600" />
                    <span className="font-mono text-[11px] font-semibold text-slate-100">{site.location}</span>
                  </div>
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold ${SITE_STYLE[site.status]}`}>
                    {site.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mb-1">{site.cover}</div>
                <div className="flex gap-4 font-mono text-[9px] text-slate-600">
                  <span>ID: {site.id}</span>
                  <span>VOL: {site.dailyVol}/day</span>
                  <span>SINCE: {site.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CNO Implants */}
        <div className="bg-[#0C0F1A] border border-amber-900/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1E2540] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-300">CNO Active Implants</span>
            <div className="flex items-center gap-2">
              <Activity size={11} className="text-green-400 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400">{activeImplants} ACTIVE</span>
            </div>
          </div>
          <div className="divide-y divide-[#1A1F35]">
            {IMPLANTS.map(imp => (
              <div key={imp.id} className="px-5 py-3 hover:bg-[#111627]/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-slate-600" />
                    <span className="font-mono text-[11px] font-semibold text-slate-100">{imp.target}</span>
                  </div>
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold ${IMP_STYLE[imp.status]}`}>
                    {imp.status}
                  </span>
                </div>
                <div className="flex gap-4 font-mono text-[9px] text-slate-600">
                  <span>ID: {imp.id}</span>
                  <span>TYPE: {imp.type}</span>
                  <span>LAST: {imp.lastContact}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1E2540] px-5 py-2.5 font-mono text-[9px] text-slate-600 flex justify-between">
            <span>EXFIL: ENCRYPTED TUNNEL // TOR BRIDGE</span>
            <span>BEACON: 300s</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SCS
