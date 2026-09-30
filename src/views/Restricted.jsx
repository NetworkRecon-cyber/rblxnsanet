import React, { useState, useEffect, useCallback } from 'react'
import { apiGetPane, apiSavePane } from '../data/api.js'
import { Card, CardHead, StatCard, Badge, Pill, Modal, Btn, Field, Input, Select, showToast } from '../components/UI.jsx'
import { Plus, Trash2, Edit2 } from 'lucide-react'

// ── TAO ──
const VECTORS = ['NETWORK','RF INTERCEPT','IMPLANT','SIGINT','HUMINT','CYBER','ELINT']
const OP_STATUSES = ['active','suspend','revoked']

export function TAO() {
  const [ops, setOps] = useState([])
  const [beacons, setBeacons] = useState([])
  const [stats, setStats] = useState({ implants: 0, pending: 0, compromised: 0, uptime: '—' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    apiGetPane('tao').then(d => {
      if (d.stats) setStats(d.stats)
      if (d.ops)   setOps(d.ops)
      if (d.beacons) setBeacons(d.beacons)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  function save(newStats, newOps, newBeacons) {
    apiSavePane('tao', { stats: newStats, ops: newOps, beacons: newBeacons }).catch(() => {})
  }
  const [addOp, setAddOp] = useState(false)
  const [addBeacon, setAddBeacon] = useState(false)
  const [editStats, setEditStats] = useState(false)

  // New op form
  const [opCode,   setOpCode]   = useState('')
  const [opTarget, setOpTarget] = useState('')
  const [opVector, setOpVector] = useState('NETWORK')
  const [opOp,     setOpOp]     = useState('')
  const [opDur,    setOpDur]    = useState('')
  const [opStatus, setOpStatus] = useState('active')

  // New beacon form
  const [bTime, setBTime] = useState('')
  const [bMsg,  setBMsg]  = useState('')
  const [bType, setBType] = useState('g')

  // Stats form
  const [sImpl, setSImpl] = useState('')
  const [sPend, setSPend] = useState('')
  const [sComp, setSComp] = useState('')
  const [sUp,   setSUp]   = useState('')

  function addOperation() {
    if (!opCode.trim() || !opTarget.trim()) { showToast('Op Code and Target required'); return }
    const newOp = { id: Date.now(), code: opCode.toUpperCase(), target: opTarget, vector: opVector, op: opOp, dur: opDur, status: opStatus }
    const newOps = [...ops, newOp]
    setOps(newOps); save(stats, newOps, beacons)
    setOpCode(''); setOpTarget(''); setOpOp(''); setOpDur(''); setOpVector('NETWORK'); setOpStatus('active')
    setAddOp(false); showToast('Operation added')
  }

  function removeOp(id) {
    const newOps = ops.filter(o => o.id !== id)
    setOps(newOps); save(stats, newOps, beacons); showToast('Operation removed')
  }

  function addBeaconEntry() {
    if (!bMsg.trim()) { showToast('Message required'); return }
    const now = new Date()
    const t = bTime || [now.getUTCHours(), now.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
    const newBeacons = [{ id: Date.now(), time: t, msg: bMsg, type: bType }, ...beacons]
    setBeacons(newBeacons); save(stats, ops, newBeacons)
    setBTime(''); setBMsg(''); setBType('g')
    setAddBeacon(false); showToast('Beacon entry added')
  }

  function saveStats() {
    setStats({ implants: sImpl || 0, pending: sPend || 0, compromised: sComp || 0, uptime: sUp || '—' })
    setEditStats(false); showToast('Stats updated')
  }

  const statusLabel = { active: 'LIVE', suspend: 'PENDING', revoked: 'COMPROMISED' }
  const dotColor    = { g: 'bg-green-500', a: 'bg-amber-500', r: 'bg-red-500' }
  const tagLabel    = { g: 'OK', a: 'WARN', r: 'ALERT' }
  const tagVariant  = { g: 'green', a: 'amber', r: 'red' }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">Tailored Access Operations</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">TAO // ACCESS OPERATIONS</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="red">TS//SCI//ECI</Badge>
          <Btn variant="ghost" onClick={() => { setSImpl(stats.implants); setSPend(stats.pending); setSComp(stats.compromised); setSUp(stats.uptime); setEditStats(true) }}>
            <Edit2 size={12} /> Edit Stats
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard num={stats.implants}    label="Active Implants" />
        <StatCard num={stats.pending}     label="Pending Ops"    color="text-amber-400" />
        <StatCard num={stats.compromised} label="Compromised"    color="text-red-400" />
        <StatCard num={stats.uptime}      label="Uptime"         color="text-green-400" />
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">Active Operations</CardHead>
          <Btn onClick={() => setAddOp(true)}><Plus size={12} /> Add Op</Btn>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>{['Op Code','Target','Vector','Operator','Duration','Status',''].map(h =>
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-[#1E2540]">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {ops.length === 0
              ? <tr><td colSpan={7} className="text-center text-xs text-slate-600 py-6">No active operations.</td></tr>
              : ops.map(o => (
                <tr key={o.id} className="border-b border-[#1E2540] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-blue-400 font-medium">{o.code}</td>
                  <td className="px-3 py-2.5 text-slate-400">{o.target}</td>
                  <td className="px-3 py-2.5"><Badge variant="dim">{o.vector}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-300">{o.op || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-400">{o.dur || '—'}</td>
                  <td className="px-3 py-2.5"><Pill variant={o.status}>{statusLabel[o.status]}</Pill></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => removeOp(o.id)} className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all ml-auto">
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
          <CardHead className="mb-0">Implant Beacon Log</CardHead>
          <Btn onClick={() => setAddBeacon(true)}><Plus size={12} /> Add Entry</Btn>
        </div>
        {beacons.length === 0
          ? <div className="text-xs text-slate-600 py-4">No beacon activity recorded.</div>
          : beacons.map(b => (
            <div key={b.id} className="flex items-start gap-3 py-2.5 border-b border-[#1E2540] last:border-0 text-xs group">
              <span className="font-mono text-slate-500 text-[11px] flex-shrink-0 w-12 mt-0.5">{b.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dotColor[b.type]}`} />
              <span className="flex-1 text-slate-300">{b.msg}</span>
              <Badge variant={tagVariant[b.type]}>{tagLabel[b.type]}</Badge>
              <button onClick={() => setBeacons(prev => prev.filter(x => x.id !== b.id))}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all">
                <Trash2 size={10} />
              </button>
            </div>
          ))
        }
      </Card>

      {/* Add Op Modal */}
      <Modal open={addOp} onClose={() => setAddOp(false)} title="Add Operation" sub="NEW TAO OPERATION ENTRY">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Op Code"><Input value={opCode} onChange={e => setOpCode(e.target.value.toUpperCase())} placeholder="OP-0000" /></Field>
          <Field label="Target"><Input value={opTarget} onChange={e => setOpTarget(e.target.value)} placeholder="NODE-ALPHA-1" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vector"><Select value={opVector} onChange={e => setOpVector(e.target.value)}>{VECTORS.map(v => <option key={v}>{v}</option>)}</Select></Field>
          <Field label="Status"><Select value={opStatus} onChange={e => setOpStatus(e.target.value)}>{OP_STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Operator"><Input value={opOp} onChange={e => setOpOp(e.target.value.toUpperCase())} placeholder="CODENAME" /></Field>
          <Field label="Duration"><Input value={opDur} onChange={e => setOpDur(e.target.value)} placeholder="00d 00h" /></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addOperation}>Add Operation</Btn><Btn variant="ghost" onClick={() => setAddOp(false)}>Cancel</Btn></div>
      </Modal>

      {/* Add Beacon Modal */}
      <Modal open={addBeacon} onClose={() => setAddBeacon(false)} title="Add Beacon Entry" sub="LOG IMPLANT BEACON ACTIVITY">
        <Field label="Message"><Input value={bMsg} onChange={e => setBMsg(e.target.value)} placeholder="IMP-0000 beacon received — NODE-X — payload 0KB" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time (UTC, optional)"><Input value={bTime} onChange={e => setBTime(e.target.value)} placeholder="14:00Z" /></Field>
          <Field label="Type"><Select value={bType} onChange={e => setBType(e.target.value)}><option value="g">OK</option><option value="a">WARN</option><option value="r">ALERT</option></Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addBeaconEntry}>Add Entry</Btn><Btn variant="ghost" onClick={() => setAddBeacon(false)}>Cancel</Btn></div>
      </Modal>

      {/* Edit Stats Modal */}
      <Modal open={editStats} onClose={() => setEditStats(false)} title="Edit Stats" sub="UPDATE TAO OVERVIEW COUNTERS">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Active Implants"><Input value={sImpl} onChange={e => setSImpl(e.target.value)} placeholder="0" /></Field>
          <Field label="Pending Ops"><Input value={sPend} onChange={e => setSPend(e.target.value)} placeholder="0" /></Field>
          <Field label="Compromised"><Input value={sComp} onChange={e => setSComp(e.target.value)} placeholder="0" /></Field>
          <Field label="Uptime"><Input value={sUp} onChange={e => setSUp(e.target.value)} placeholder="99.9%" /></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={saveStats}>Save</Btn><Btn variant="ghost" onClick={() => setEditStats(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}

// ── Analytics ──
const SIG_TYPES = ['SIGINT','COMINT','ELINT','MASINT','ACINT','OSINT']
const SIG_COLORS = { SIGINT:'bg-blue-500', COMINT:'bg-blue-400', ELINT:'bg-amber-500', MASINT:'bg-slate-400', ACINT:'bg-purple-500', OSINT:'bg-teal-500' }

export function Analytics() {
  const [stats, setStats] = useState({ intercepts: 0, flagged: 0, rate: '—', targets: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    apiGetPane('analytics').then(d => {
      if (d.stats)   setStats(d.stats)
      if (d.bars)    setBars(d.bars)
      if (d.signals) setSignals(d.signals)
      if (d.queue)   setQueue(d.queue)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  function save(ns, nb, nsig, nq) {
    apiSavePane('analytics', { stats: ns, bars: nb, signals: nsig, queue: nq }).catch(() => {})
  }
  const [bars,  setBars]  = useState([
    { label: 'SIGINT', val: 0 },
    { label: 'COMINT', val: 0 },
    { label: 'ELINT',  val: 0 },
    { label: 'MASINT', val: 0 },
    { label: 'ACINT',  val: 0 },
  ])
  const [signals, setSignals] = useState([])
  const [queue,   setQueue]   = useState([])

  const [editStats,  setEditStats]  = useState(false)
  const [editBars,   setEditBars]   = useState(false)
  const [addSig,     setAddSig]     = useState(false)
  const [addQueue,   setAddQueue]   = useState(false)

  // Stats form
  const [sInt,  setSInt]  = useState('')
  const [sFlag, setSFlag] = useState('')
  const [sRate, setSRate] = useState('')
  const [sTgt,  setSTgt]  = useState('')

  // Signal form
  const [sigTime, setSigTime] = useState('')
  const [sigMsg,  setSigMsg]  = useState('')
  const [sigPri,  setSigPri]  = useState('P2')
  const [sigType, setSigType] = useState('a')

  // Queue form
  const [qRef,     setQRef]     = useState('')
  const [qSrc,     setQSrc]     = useState('')
  const [qType,    setQType]    = useState('SIGINT')
  const [qSize,    setQSize]    = useState('')
  const [qAnalyst, setQAnalyst] = useState('')
  const [qStatus,  setQStatus]  = useState('active')

  const max = Math.max(...bars.map(b => b.val), 1)

  function saveStats() {
    setStats({ intercepts: Number(sInt)||0, flagged: Number(sFlag)||0, rate: sRate||'—', targets: Number(sTgt)||0 })
    setEditStats(false); showToast('Stats updated')
  }

  function saveBars() { setEditBars(false); showToast('Collection breakdown updated') }
  function updateBar(label, val) { setBars(prev => prev.map(b => b.label === label ? { ...b, val: Number(val)||0 } : b)) }

  function addSignal() {
    if (!sigMsg.trim()) { showToast('Message required'); return }
    const now = new Date()
    const t = sigTime || [now.getUTCHours(), now.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
    setSignals(prev => [{ id: Date.now(), time: t, msg: sigMsg, pri: sigPri, type: sigType }, ...prev])
    setSigTime(''); setSigMsg(''); setSigPri('P2'); setSigType('a')
    setAddSig(false); showToast('Signal flagged')
  }

  function addQueueEntry() {
    if (!qRef.trim() || !qSrc.trim()) { showToast('Ref and Source required'); return }
    setQueue(prev => [{ id: Date.now(), ref: qRef.toUpperCase(), src: qSrc, type: qType, size: qSize, analyst: qAnalyst.toUpperCase(), status: qStatus }, ...prev])
    setQRef(''); setQSrc(''); setQSize(''); setQAnalyst(''); setQType('SIGINT'); setQStatus('active')
    setAddQueue(false); showToast('Entry added to queue')
  }

  const dotColor   = { g: 'bg-green-500', a: 'bg-amber-500', r: 'bg-red-500' }
  const barColor   = (l) => SIG_COLORS[l] || 'bg-blue-500'

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">SIGINT Analytics</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">SIGNALS INTELLIGENCE — COLLECTION & PROCESSING METRICS</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="green">LIVE FEED</Badge>
          <Btn variant="ghost" onClick={() => { setSInt(stats.intercepts); setSFlag(stats.flagged); setSRate(stats.rate); setSTgt(stats.targets); setEditStats(true) }}>
            <Edit2 size={12} /> Edit Stats
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard num={stats.intercepts.toLocaleString()} label="Intercepts Today" />
        <StatCard num={stats.flagged}  label="Flagged Signals" color="text-amber-400" />
        <StatCard num={stats.rate}     label="Collection Rate" color="text-green-400" />
        <StatCard num={stats.targets}  label="Priority Targets" color="text-red-400" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardHead className="mb-0">Collection by Type</CardHead>
            <Btn variant="ghost" onClick={() => setEditBars(true)} className="text-[10px] px-2 py-1"><Edit2 size={11} /></Btn>
          </div>
          {bars.map(b => (
            <div key={b.label} className="mb-2.5">
              <div className="flex justify-between text-[10px] tracking-[0.06em] mb-1">
                <span className="text-slate-400">{b.label}</span>
                <span className="text-slate-200">{b.val}%</span>
              </div>
              <div className="h-1.5 bg-[#1E2540] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor(b.label)}`}
                  style={{ width: `${(b.val / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardHead className="mb-0">Flagged Signal Log</CardHead>
            <Btn onClick={() => setAddSig(true)}><Plus size={12} /> Flag Signal</Btn>
          </div>
          {signals.length === 0
            ? <div className="text-xs text-slate-600 py-4">No flagged signals.</div>
            : signals.map(s => (
              <div key={s.id} className="flex items-start gap-3 py-2.5 border-b border-[#1E2540] last:border-0 text-xs group">
                <span className="font-mono text-slate-500 text-[11px] flex-shrink-0 w-12 mt-0.5">{s.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dotColor[s.type]}`} />
                <span className="flex-1 text-slate-300">{s.msg}</span>
                <Badge variant={s.type === 'r' ? 'red' : 'amber'}>{s.pri}</Badge>
                <button onClick={() => setSignals(prev => prev.filter(x => x.id !== s.id))}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all">
                  <Trash2 size={10} />
                </button>
              </div>
            ))
          }
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardHead className="mb-0">Processing Queue</CardHead>
          <Btn onClick={() => setAddQueue(true)}><Plus size={12} /> Add Entry</Btn>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>{['Ref','Source','Type','Size','Analyst','Status',''].map(h =>
              <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-[#1E2540]">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {queue.length === 0
              ? <tr><td colSpan={7} className="text-center text-xs text-slate-600 py-6">Queue is empty.</td></tr>
              : queue.map(q => (
                <tr key={q.id} className="border-b border-[#1E2540] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-blue-400 font-medium">{q.ref}</td>
                  <td className="px-3 py-2.5 text-slate-400">{q.src}</td>
                  <td className="px-3 py-2.5"><Badge variant="dim">{q.type}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-300">{q.size || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-300">{q.analyst || '—'}</td>
                  <td className="px-3 py-2.5"><Pill variant={q.status}>{q.status === 'active' ? 'PROCESSING' : 'QUEUED'}</Pill></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => setQueue(prev => prev.filter(x => x.id !== q.id))}
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

      {/* Edit Stats Modal */}
      <Modal open={editStats} onClose={() => setEditStats(false)} title="Edit Stats" sub="UPDATE ANALYTICS COUNTERS">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Intercepts Today"><Input value={sInt}  onChange={e => setSInt(e.target.value)}  placeholder="0" /></Field>
          <Field label="Flagged Signals"> <Input value={sFlag} onChange={e => setSFlag(e.target.value)} placeholder="0" /></Field>
          <Field label="Collection Rate"> <Input value={sRate} onChange={e => setSRate(e.target.value)} placeholder="98.4%" /></Field>
          <Field label="Priority Targets"><Input value={sTgt}  onChange={e => setSTgt(e.target.value)}  placeholder="0" /></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={saveStats}>Save</Btn><Btn variant="ghost" onClick={() => setEditStats(false)}>Cancel</Btn></div>
      </Modal>

      {/* Edit Bars Modal */}
      <Modal open={editBars} onClose={() => setEditBars(false)} title="Edit Collection Breakdown" sub="SET PERCENTAGE PER TYPE">
        {bars.map(b => (
          <Field key={b.label} label={b.label}>
            <Input type="number" min="0" max="100" value={b.val} onChange={e => updateBar(b.label, e.target.value)} placeholder="0" />
          </Field>
        ))}
        <div className="flex gap-2.5 mt-2"><Btn onClick={saveBars}>Save</Btn><Btn variant="ghost" onClick={() => setEditBars(false)}>Cancel</Btn></div>
      </Modal>

      {/* Add Signal Modal */}
      <Modal open={addSig} onClose={() => setAddSig(false)} title="Flag Signal" sub="LOG FLAGGED SIGNAL ENTRY">
        <Field label="Message"><Input value={sigMsg} onChange={e => setSigMsg(e.target.value)} placeholder="Priority keyword match — COMMS channel X" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Time (UTC)"><Input value={sigTime} onChange={e => setSigTime(e.target.value)} placeholder="14:00Z" /></Field>
          <Field label="Priority"><Select value={sigPri} onChange={e => setSigPri(e.target.value)}><option>P1</option><option>P2</option><option>P3</option></Select></Field>
          <Field label="Type"><Select value={sigType} onChange={e => setSigType(e.target.value)}><option value="r">ALERT</option><option value="a">WARN</option><option value="g">OK</option></Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addSignal}>Flag Signal</Btn><Btn variant="ghost" onClick={() => setAddSig(false)}>Cancel</Btn></div>
      </Modal>

      {/* Add Queue Entry Modal */}
      <Modal open={addQueue} onClose={() => setAddQueue(false)} title="Add Queue Entry" sub="ADD SIGNAL TO PROCESSING QUEUE">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ref"><Input value={qRef} onChange={e => setQRef(e.target.value)} placeholder="SIG-0000" /></Field>
          <Field label="Source"><Input value={qSrc} onChange={e => setQSrc(e.target.value)} placeholder="CHANNEL-X" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><Select value={qType} onChange={e => setQType(e.target.value)}>{SIG_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Size"><Input value={qSize} onChange={e => setQSize(e.target.value)} placeholder="0.0 MB" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Analyst"><Input value={qAnalyst} onChange={e => setQAnalyst(e.target.value)} placeholder="CODENAME" /></Field>
          <Field label="Status"><Select value={qStatus} onChange={e => setQStatus(e.target.value)}><option value="active">PROCESSING</option><option value="suspend">QUEUED</option></Select></Field>
        </div>
        <div className="flex gap-2.5 mt-2"><Btn onClick={addQueueEntry}>Add Entry</Btn><Btn variant="ghost" onClick={() => setAddQueue(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
