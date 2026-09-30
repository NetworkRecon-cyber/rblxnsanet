import React, { useState, useEffect } from 'react'
import { apiGetPane, apiSavePane } from '../data/api.js'
import { Card, CardHead, StatCard, Badge, Pill, Modal, Btn, Field, Input, Select, showToast } from '../components/UI.jsx'
import { Plus, Trash2, Edit2 } from 'lucide-react'

// ── SPECIAL COLLECTIONS SERVICE ──
const SITE_TYPES = ['EMBASSY','CONSULATE','DIPLOMATIC FACILITY','FOREIGN MISSION','SAFE HOUSE','COVER SITE']
const SITE_STATUSES = ['active','suspend','revoked']
const COLLECTION_METHODS = ['SIGINT','COMINT','ELINT','MASINT','TECHINT','IMINT','ACOUSTINT']

export function SCS() {
  const [stats, setStats]   = useState({ sites: 0, active: 0, dark: 0, yield: '—' })
  const [sites, setSites]   = useState([])
  const [intel, setIntel]   = useState([])

  useEffect(() => {
    apiGetPane('scs').then(d => {
      if (d.stats) setStats(d.stats)
      if (d.sites) setSites(d.sites)
      if (d.intel) setIntel(d.intel)
    }).catch(() => {})
  }, [])

  function save(ns, nsi, ni) {
    apiSavePane('scs', { stats: ns, sites: nsi, intel: ni }).catch(() => {})
  }
  const [editStats, setEditStats] = useState(false)
  const [addSite,   setAddSite]   = useState(false)
  const [addIntel,  setAddIntel]  = useState(false)

  // Stats form
  const [sSites, setSSites] = useState('')
  const [sActive, setSActive] = useState('')
  const [sDark,   setSDark]   = useState('')
  const [sYield,  setSYield]  = useState('')

  // Site form
  const [siteName,   setSiteName]   = useState('')
  const [siteType,   setSiteType]   = useState('EMBASSY')
  const [siteCity,   setSiteCity]   = useState('')
  const [siteMethod, setSiteMethod] = useState('SIGINT')
  const [siteStatus, setSiteStatus] = useState('active')
  const [siteOp,     setSiteOp]     = useState('')

  // Intel form
  const [iTime,   setITime]   = useState('')
  const [iMsg,    setIMsg]    = useState('')
  const [iType,   setIType]   = useState('g')
  const [iRef,    setIRef]    = useState('')

  function saveStats() {
    const ns = { sites: Number(sSites)||0, active: Number(sActive)||0, dark: Number(sDark)||0, yield: sYield||'—' }
    setStats(ns); save(ns, sites, intel)
    setEditStats(false); showToast('Stats updated')
  }

  function addSiteEntry() {
    if (!siteName.trim()) { showToast('Site name required'); return }
    const newSites = [...sites, { id: Date.now(), name: siteName, type: siteType, city: siteCity, method: siteMethod, status: siteStatus, op: siteOp }]
    setSites(newSites); save(stats, newSites, intel)
    setSiteName(''); setSiteCity(''); setSiteOp('')
    setAddSite(false); showToast('Collection site added')
  }

  function addIntelEntry() {
    if (!iMsg.trim()) { showToast('Message required'); return }
    const now = new Date()
    const t = iTime || [now.getUTCHours(), now.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
    const newIntel = [{ id: Date.now(), time: t, msg: iMsg, type: iType, ref: iRef }, ...intel]
    setIntel(newIntel); save(stats, sites, newIntel)
    setITime(''); setIMsg(''); setIRef(''); setIType('g')
    setAddIntel(false); showToast('Intel entry logged')
  }

  const dotColor  = { g: 'bg-green-500', a: 'bg-amber-500', r: 'bg-red-500' }
  const tagLabel  = { g: 'COLLECTED', a: 'PARTIAL', r: 'FAILED' }
  const tagVariant= { g: 'green', a: 'amber', r: 'red' }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
<div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Special Collections Service</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">SCS // CLANDESTINE TECHNICAL COLLECTION</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="red">TS//SCI//ECI</Badge>
          <Btn variant="ghost" onClick={() => { setSSites(stats.sites); setSActive(stats.active); setSDark(stats.dark); setSYield(stats.yield); setEditStats(true) }}>
            <Edit2 size={12} /> Edit Stats
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard num={stats.sites}  label="Total Sites" />
        <StatCard num={stats.active} label="Active"      color="text-green-400" />
        <StatCard num={stats.dark}   label="Gone Dark"   color="text-red-400" />
        <StatCard num={stats.yield}  label="Yield Rate"  color="text-blue-400" />
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">Collection Sites</CardHead>
          <Btn onClick={() => setAddSite(true)}><Plus size={12} /> Add Site</Btn>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>{['Site','Type','Location','Method','Operator','Status',''].map(h =>
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-[#1E2540]">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {sites.length === 0
              ? <tr><td colSpan={7} className="text-center text-xs text-slate-600 py-6">No collection sites registered.</td></tr>
              : sites.map(s => (
                <tr key={s.id} className="border-b border-[#1E2540] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-blue-400 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5"><Badge variant="dim">{s.type}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-400">{s.city || '—'}</td>
                  <td className="px-3 py-2.5"><Badge variant="blue">{s.method}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-300">{s.op || '—'}</td>
                  <td className="px-3 py-2.5"><Pill variant={s.status}>{s.status.toUpperCase()}</Pill></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => setSites(prev => prev.filter(x => x.id !== s.id))}
                      className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all ml-auto">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">Collection Log</CardHead>
          <Btn onClick={() => setAddIntel(true)}><Plus size={12} /> Add Entry</Btn>
        </div>
        {intel.length === 0
          ? <div className="text-xs text-slate-600 py-4">No collection activity logged.</div>
          : intel.map(i => (
            <div key={i.id} className="flex items-start gap-3 py-2.5 border-b border-[#1E2540] last:border-0 text-xs group">
              <span className="font-mono text-slate-500 text-[11px] flex-shrink-0 w-12 mt-0.5">{i.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dotColor[i.type]}`} />
              <span className="flex-1 text-slate-300">{i.msg}</span>
              {i.ref && <span className="font-mono text-[10px] text-slate-500">{i.ref}</span>}
              <Badge variant={tagVariant[i.type]}>{tagLabel[i.type]}</Badge>
              <button onClick={() => setIntel(prev => prev.filter(x => x.id !== i.id))}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all">
                <Trash2 size={10} />
              </button>
            </div>
          ))
        }
      </Card>

      {/* Modals */}
      <Modal open={editStats} onClose={() => setEditStats(false)} title="Edit Stats" sub="UPDATE SCS OVERVIEW COUNTERS">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Total Sites">  <Input value={sSites}  onChange={e => setSSites(e.target.value)}  placeholder="0" /></Field>
          <Field label="Active">       <Input value={sActive} onChange={e => setSActive(e.target.value)} placeholder="0" /></Field>
          <Field label="Gone Dark">    <Input value={sDark}   onChange={e => setSDark(e.target.value)}   placeholder="0" /></Field>
          <Field label="Yield Rate">   <Input value={sYield}  onChange={e => setSYield(e.target.value)}  placeholder="94%" /></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={saveStats}>Save</Btn><Btn variant="ghost" onClick={() => setEditStats(false)}>Cancel</Btn></div>
      </Modal>

      <Modal open={addSite} onClose={() => setAddSite(false)} title="Add Collection Site" sub="REGISTER NEW SCS COLLECTION SITE">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Site Code / Name"><Input value={siteName} onChange={e => setSiteName(e.target.value.toUpperCase())} placeholder="SITE-ALPHA" /></Field>
          <Field label="City / Location"> <Input value={siteCity} onChange={e => setSiteCity(e.target.value)} placeholder="Moscow, RU" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Site Type">    <Select value={siteType}   onChange={e => setSiteType(e.target.value)}  >{SITE_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Method">       <Select value={siteMethod} onChange={e => setSiteMethod(e.target.value)}>{COLLECTION_METHODS.map(m => <option key={m}>{m}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Operator">     <Input  value={siteOp}     onChange={e => setSiteOp(e.target.value.toUpperCase())} placeholder="CODENAME" /></Field>
          <Field label="Status">       <Select value={siteStatus} onChange={e => setSiteStatus(e.target.value)}>{SITE_STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addSiteEntry}>Add Site</Btn><Btn variant="ghost" onClick={() => setAddSite(false)}>Cancel</Btn></div>
      </Modal>

      <Modal open={addIntel} onClose={() => setAddIntel(false)} title="Log Collection Entry" sub="ADD COLLECTION ACTIVITY ENTRY">
        <Field label="Message"><Input value={iMsg} onChange={e => setIMsg(e.target.value)} placeholder="Collection attempt at SITE-ALPHA — payload received" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Time (UTC)"><Input value={iTime} onChange={e => setITime(e.target.value)} placeholder="14:00Z" /></Field>
          <Field label="Ref">       <Input value={iRef}  onChange={e => setIRef(e.target.value)}  placeholder="SCS-REF-000" /></Field>
          <Field label="Result">    <Select value={iType} onChange={e => setIType(e.target.value)}><option value="g">COLLECTED</option><option value="a">PARTIAL</option><option value="r">FAILED</option></Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addIntelEntry}>Log Entry</Btn><Btn variant="ghost" onClick={() => setAddIntel(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}

// ── COMPUTER NETWORK OPERATIONS ──
const CNO_TYPES = ['CNE','CNA','CND','EXPLOIT','IMPLANT','BACKDOOR','MALWARE','DENIAL']
const CNO_STATUSES = ['active','suspend','revoked']
const TARGET_TYPES = ['GOVERNMENT','MILITARY','INFRASTRUCTURE','COMMERCIAL','RESEARCH','COMMS']

export function CNO() {
  const [stats, setStats]     = useState({ ops: 0, targets: 0, implants: 0, success: '—' })
  const [ops,   setOps]       = useState([])
  const [events,setEvents]    = useState([])

  useEffect(() => {
    apiGetPane('cno').then(d => {
      if (d.stats)  setStats(d.stats)
      if (d.ops)    setOps(d.ops)
      if (d.events) setEvents(d.events)
    }).catch(() => {})
  }, [])

  function save(ns, no, ne) {
    apiSavePane('cno', { stats: ns, ops: no, events: ne }).catch(() => {})
  }
  const [editStats, setEditStats] = useState(false)
  const [addOp,     setAddOp]     = useState(false)
  const [addEvent,  setAddEvent]  = useState(false)

  // Stats form
  const [sOps,  setSOps]  = useState('')
  const [sTgt,  setSTgt]  = useState('')
  const [sImpl, setSImpl] = useState('')
  const [sSucc, setSSuc]  = useState('')

  // Op form
  const [opId,     setOpId]     = useState('')
  const [opTarget, setOpTarget] = useState('')
  const [opType,   setOpType]   = useState('CNE')
  const [opTgtType,setOpTgtType]= useState('GOVERNMENT')
  const [opOp,     setOpOp]     = useState('')
  const [opStatus, setOpStatus] = useState('active')
  const [opVec,    setOpVec]    = useState('')

  // Event form
  const [eTime, setETime] = useState('')
  const [eMsg,  setEMsg]  = useState('')
  const [eType, setEType] = useState('g')
  const [eRef,  setERef]  = useState('')

  function saveStats() {
    const ns = { ops: Number(sOps)||0, targets: Number(sTgt)||0, implants: Number(sImpl)||0, success: sSucc||'—' }
    setStats(ns); save(ns, ops, events)
    setEditStats(false); showToast('Stats updated')
  }

  function addOpEntry() {
    if (!opId.trim() || !opTarget.trim()) { showToast('Op ID and Target required'); return }
    const newOps = [...ops, { id: Date.now(), opId: opId.toUpperCase(), target: opTarget, type: opType, tgtType: opTgtType, op: opOp.toUpperCase(), status: opStatus, vec: opVec }]
    setOps(newOps); save(stats, newOps, events)
    setOpId(''); setOpTarget(''); setOpOp(''); setOpVec('')
    setAddOp(false); showToast('CNO operation added')
  }

  function addEventEntry() {
    if (!eMsg.trim()) { showToast('Message required'); return }
    const now = new Date()
    const t = eTime || [now.getUTCHours(), now.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
    const newEvents = [{ id: Date.now(), time: t, msg: eMsg, type: eType, ref: eRef }, ...events]
    setEvents(newEvents); save(stats, ops, newEvents)
    setETime(''); setEMsg(''); setERef(''); setEType('g')
    setAddEvent(false); showToast('Event logged')
  }

  const dotColor  = { g: 'bg-green-500', a: 'bg-amber-500', r: 'bg-red-500' }
  const tagLabel  = { g: 'SUCCESS', a: 'PARTIAL', r: 'FAILED' }
  const tagVariant= { g: 'green', a: 'amber', r: 'red' }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
<div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Computer Network Operations</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">CNO // OFFENSIVE & DEFENSIVE CYBER OPERATIONS</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="red">TS//SCI//ECI</Badge>
          <Btn variant="ghost" onClick={() => { setSOps(stats.ops); setSTgt(stats.targets); setSImpl(stats.implants); setSSuc(stats.success); setEditStats(true) }}>
            <Edit2 size={12} /> Edit Stats
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard num={stats.ops}      label="Active Ops" />
        <StatCard num={stats.targets}  label="Targets"    color="text-amber-400" />
        <StatCard num={stats.implants} label="Implants"   color="text-blue-400" />
        <StatCard num={stats.success}  label="Success Rate" color="text-green-400" />
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">CNO Operations</CardHead>
          <Btn onClick={() => setAddOp(true)}><Plus size={12} /> Add Op</Btn>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>{['Op ID','Target','Type','Target Type','Operator','Vector','Status',''].map(h =>
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-[#1E2540]">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {ops.length === 0
              ? <tr><td colSpan={8} className="text-center text-xs text-slate-600 py-6">No CNO operations logged.</td></tr>
              : ops.map(o => (
                <tr key={o.id} className="border-b border-[#1E2540] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-blue-400 font-medium">{o.opId}</td>
                  <td className="px-3 py-2.5 text-slate-400">{o.target}</td>
                  <td className="px-3 py-2.5"><Badge variant="red">{o.type}</Badge></td>
                  <td className="px-3 py-2.5"><Badge variant="dim">{o.tgtType}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-300">{o.op || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-400">{o.vec || '—'}</td>
                  <td className="px-3 py-2.5"><Pill variant={o.status}>{o.status.toUpperCase()}</Pill></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => setOps(prev => prev.filter(x => x.id !== o.id))}
                      className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all ml-auto">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">Event Log</CardHead>
          <Btn onClick={() => setAddEvent(true)}><Plus size={12} /> Log Event</Btn>
        </div>
        {events.length === 0
          ? <div className="text-xs text-slate-600 py-4">No events logged.</div>
          : events.map(e => (
            <div key={e.id} className="flex items-start gap-3 py-2.5 border-b border-[#1E2540] last:border-0 text-xs group">
              <span className="font-mono text-slate-500 text-[11px] flex-shrink-0 w-12 mt-0.5">{e.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dotColor[e.type]}`} />
              <span className="flex-1 text-slate-300">{e.msg}</span>
              {e.ref && <span className="font-mono text-[10px] text-slate-500">{e.ref}</span>}
              <Badge variant={tagVariant[e.type]}>{tagLabel[e.type]}</Badge>
              <button onClick={() => setEvents(prev => prev.filter(x => x.id !== e.id))}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all">
                <Trash2 size={10} />
              </button>
            </div>
          ))
        }
      </Card>

      {/* Modals */}
      <Modal open={editStats} onClose={() => setEditStats(false)} title="Edit Stats" sub="UPDATE CNO OVERVIEW COUNTERS">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Active Ops">   <Input value={sOps}  onChange={e => setSOps(e.target.value)}  placeholder="0" /></Field>
          <Field label="Targets">      <Input value={sTgt}  onChange={e => setSTgt(e.target.value)}  placeholder="0" /></Field>
          <Field label="Implants">     <Input value={sImpl} onChange={e => setSImpl(e.target.value)} placeholder="0" /></Field>
          <Field label="Success Rate"> <Input value={sSucc} onChange={e => setSSuc(e.target.value)}  placeholder="94%" /></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={saveStats}>Save</Btn><Btn variant="ghost" onClick={() => setEditStats(false)}>Cancel</Btn></div>
      </Modal>

      <Modal open={addOp} onClose={() => setAddOp(false)} title="Add CNO Operation" sub="LOG NEW COMPUTER NETWORK OPERATION">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Op ID">        <Input  value={opId}      onChange={e => setOpId(e.target.value.toUpperCase())}     placeholder="CNO-0000" /></Field>
          <Field label="Target">       <Input  value={opTarget}  onChange={e => setOpTarget(e.target.value)}               placeholder="TARGET-SYSTEM-01" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Op Type">      <Select value={opType}    onChange={e => setOpType(e.target.value)}>{CNO_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Target Type">  <Select value={opTgtType} onChange={e => setOpTgtType(e.target.value)}>{TARGET_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Operator">     <Input  value={opOp}      onChange={e => setOpOp(e.target.value)}                   placeholder="CODENAME" /></Field>
          <Field label="Vector">       <Input  value={opVec}     onChange={e => setOpVec(e.target.value)}                  placeholder="SPEAR-PHISH / SUPPLY CHAIN" /></Field>
        </div>
        <Field label="Status"><Select value={opStatus} onChange={e => setOpStatus(e.target.value)}>{CNO_STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addOpEntry}>Add Operation</Btn><Btn variant="ghost" onClick={() => setAddOp(false)}>Cancel</Btn></div>
      </Modal>

      <Modal open={addEvent} onClose={() => setAddEvent(false)} title="Log Event" sub="ADD CNO EVENT ENTRY">
        <Field label="Message"><Input value={eMsg} onChange={e => setEMsg(e.target.value)} placeholder="Exploit deployed — TARGET-SYSTEM-01 — access established" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Time (UTC)"><Input value={eTime} onChange={e => setETime(e.target.value)} placeholder="14:00Z" /></Field>
          <Field label="Ref">       <Input value={eRef}  onChange={e => setERef(e.target.value)}  placeholder="CNO-REF-000" /></Field>
          <Field label="Result">    <Select value={eType} onChange={e => setEType(e.target.value)}><option value="g">SUCCESS</option><option value="a">PARTIAL</option><option value="r">FAILED</option></Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addEventEntry}>Log Event</Btn><Btn variant="ghost" onClick={() => setAddEvent(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
