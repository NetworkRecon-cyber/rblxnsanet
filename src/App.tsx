import React, { useState, useEffect } from 'react'
import { ClassBanner, ToastProvider, showToast } from './components/UI'
import Topbar    from './components/Topbar'
import Sidebar   from './components/Sidebar'
import GoBar     from './components/GoBar'
import AccessCode from './components/AccessCode'
import Login     from './views/Login'
import Overview  from './views/Overview'
import Staff     from './views/Staff'
import Comms     from './views/Comms'
import FileVault from './views/FileVault'
import Accounts  from './views/Accounts'
import ANTCatalog from './views/ANTCatalog'
import Awards    from './views/Awards'
import { TAO, Analytics } from './views/Restricted'
import { SCS }   from './views/SCS_CNO'
import { hasPermission, GO_ROUTES, USERS } from './data/auth'
import { apiLogout, apiHeartbeat } from './data/api'
import type { User, GoRoute } from './data/auth'

// ── Pane classification lines ──
const PANE_CLASS: Record<string, string> = {
  scs:       'TOP SECRET//COMINT//COMINT-STATEROOM//ORCON/NOFORN',
  tao:       'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN',
  analytics: 'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN',
  ant:       'TOP SECRET//SI//TALENT KEYHOLE//ORCON/NOFORN',
}
const DEFAULT_CLASS = 'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN'

// ── Watermark utilities ──
function seededRandom(seed: number) {
  let s = seed
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function strToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0
  return Math.abs(hash)
}

// ── Boot lines ──
const BOOT_LINES = [
  'INITIALIZING SECURE CHANNEL...',
  'LOADING CRYPTOGRAPHIC MODULE [AES-256-GCM]...',
  'VERIFYING AGENT CREDENTIALS...',
  'CONNECTING TO NSANET NODE...',
  'TUNNEL ESTABLISHED — ZERO-KNOWLEDGE HANDSHAKE OK',
  'LOADING PERSONNEL DATABASE...',
  'LOADING FILE VAULT [ENCRYPTED]...',
  'ALL SYSTEMS NOMINAL — WELCOME, AGENT',
]

type Phase = 'login' | 'boot' | 'portal'

export default function App() {
  const [phase,     setPhase]     = useState<Phase>('login')
  const [user,      setUser]      = useState<User | null>(null)
  const [pane,      setPane]      = useState('overview')
  const [goOpen,    setGoOpen]    = useState(false)
  const [accounts,  setAccounts]  = useState<User[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [accessRoute,  setAccessRoute]  = useState<GoRoute | null>(null)
  const [pendingRoute, setPendingRoute] = useState<GoRoute | null>(null)

  const [bootLines, setBootLines] = useState<string[]>([])
  const [bootPct,   setBootPct]   = useState(0)

  // ── Restore session ──
  useEffect(() => {
    const stored = sessionStorage.getItem('nsanet_user')
    const sid    = sessionStorage.getItem('nsanet_sid')
    if (stored) {
      try {
        const u = JSON.parse(stored) as User
        setUser(u); setSessionId(sid); setPhase('portal')
        handleGoParam(u)
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleGoParam(u: User) {
    const go = new URLSearchParams(window.location.search).get('go')
    if (go && GO_ROUTES[go.toLowerCase()]) {
      const route = GO_ROUTES[go.toLowerCase()]
      if (route.restricted) { setAccessRoute(route); setPendingRoute(route) }
      else setPane(route.pane)
    }
  }

  // ── Login — now receives User + sid directly from Login.tsx ──
  function handleLogin(loggedUser: User, sid: string) {
    sessionStorage.setItem('nsanet_user', JSON.stringify(loggedUser))
    sessionStorage.setItem('nsanet_sid', sid)
    setUser(loggedUser); setSessionId(sid)
    setPhase('boot'); setBootLines([]); setBootPct(0)
    let idx = 0
    function next() {
      if (idx >= BOOT_LINES.length) {
        injectWatermarks(loggedUser.codename, sid)
        const stored = sessionStorage.getItem('nsanet_pending_go')
        if (stored && GO_ROUTES[stored]) {
          const route = GO_ROUTES[stored]
          sessionStorage.removeItem('nsanet_pending_go')
          setPhase('portal')
          if (route.restricted) { setAccessRoute(route); setPendingRoute(route) }
          else setPane(route.pane)
        } else { setPhase('portal') }
        return
      }
      setBootLines(prev => [...prev, BOOT_LINES[idx]])
      setBootPct(Math.round(((idx + 1) / BOOT_LINES.length) * 100))
      idx++
      setTimeout(next, 310)
    }
    setTimeout(next, 400)
  }

  // ── Watermarks ──
  function injectWatermarks(codename: string, sid: string) {
    document.querySelectorAll('.__nsanet_wm,.__nsanet_px').forEach(e => e.remove())
    const bits = sid.split('').flatMap(c => {
      const b = c.charCodeAt(0)
      return Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1)
    })
    const sync = [1,0,1,0,1,0,1,0,1,1,1,1,0,0,0,0]
    const allBits = [...sync, ...bits]
    const wm = document.createElement('canvas')
    wm.className = '__nsanet_wm'; wm.width = allBits.length; wm.height = 2
    wm.style.cssText = `position:fixed;bottom:0;left:0;width:${allBits.length}px;height:2px;opacity:0.004;pointer-events:none;z-index:2147483647;image-rendering:pixelated;`
    const ctx = wm.getContext('2d')!
    allBits.forEach((bit, x) => { ctx.fillStyle = bit ? 'rgba(1,0,0,1)' : 'rgba(0,0,0,1)'; ctx.fillRect(x, 0, 1, 2) })
    document.body.appendChild(wm)
    const rng = seededRandom(strToSeed(codename))
    const pbits = codename.split('').flatMap(c => Array.from({ length: 8 }, (_, i) => (c.charCodeAt(0) >> (7-i)) & 1))
    for (let i = 0; i < 50; i++) {
      const px = document.createElement('canvas')
      px.className = '__nsanet_px'; px.width = 1; px.height = 1
      px.style.cssText = `position:fixed;left:${(rng()*98+1).toFixed(3)}%;top:${(rng()*98+1).toFixed(3)}%;width:1px;height:1px;opacity:0.008;pointer-events:none;z-index:2147483640;image-rendering:pixelated;`
      const c2 = px.getContext('2d')!
      c2.fillStyle = pbits[i % pbits.length] ? 'rgba(2,0,0,1)' : 'rgba(0,0,2,1)'
      c2.fillRect(0,0,1,1); document.body.appendChild(px)
    }
  }

  // ── Logout ──
  function handleLogout() {
    document.querySelectorAll('.__nsanet_wm,.__nsanet_px').forEach(e => e.remove())
    sessionStorage.removeItem('nsanet_pending_go')
    sessionStorage.removeItem('nsanet_user')
    sessionStorage.removeItem('nsanet_sid')
    apiLogout().catch(() => {})
    setUser(null); setSessionId(null); setPhase('login')
    setPane('overview'); setGoOpen(false)
    setAccessRoute(null); setPendingRoute(null)
  }

  // ── Navigate ──
  function navigate(key: string) {
    if (!hasPermission(user, 'staffView') && key === 'staff')    { showToast('ACCESS DENIED'); return }
    if (!hasPermission(user, 'vaultView') && key === 'files')    { showToast('ACCESS DENIED'); return }
    if (!hasPermission(user, 'acctView')  && key === 'accounts') { showToast('ACCESS DENIED'); return }
    if (!hasPermission(user, 'antView')   && key === 'ant')      { showToast('ACCESS DENIED'); return }
    setPane(key)
  }

  function handleRestricted(key: string) {
    const route = GO_ROUTES[key]
    if (route) { setAccessRoute(route); setPendingRoute(route) }
  }

  function onAccessSuccess() {
    if (pendingRoute) setPane(pendingRoute.pane)
    setAccessRoute(null); setPendingRoute(null)
  }

  // ── Screenshot detection ──
  useEffect(() => {
    if (phase !== 'portal') return
    const log: object[] = []
    function detect(method: string) {
      log.push({ method, sid: sessionId, user: user?.codename, time: new Date().toUTCString() })
      showToast('⚠ SCREENSHOT DETECTED — Attempt logged')
      console.warn('[NSANET SECURITY]', log[log.length-1])
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'PrintScreen' || e.key === 'F13' || (e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key))) detect('KEYBOARD')
    }
    function onCopy() { if (!window.getSelection()?.toString()) detect('CLIPBOARD') }
    async function checkClipboard() {
      if (!navigator.clipboard?.read) return
      try {
        const items = await navigator.clipboard.read()
        for (const item of items) {
          if (item.types.some(t => t.startsWith('image/'))) { detect('WIN+SHIFT+S'); break }
        }
      } catch {}
    }
    function onFocus() { if (user) setTimeout(checkClipboard, 300) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('copy', onCopy)
    window.addEventListener('focus', onFocus)
    ;(window as Window & { nsanetScreenshotLog?: () => object[] }).nsanetScreenshotLog = () => { console.table(log); return log }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('copy', onCopy)
      window.removeEventListener('focus', onFocus)
    }
  }, [phase, user, sessionId])

  // ── Ctrl+K ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && phase === 'portal') {
        e.preventDefault(); setGoOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // ── Heartbeat ──
  useEffect(() => {
    if (phase !== 'portal' || !user) return
    const t = setInterval(async () => {
      try {
        const ok = await apiHeartbeat()
        if (!ok) {
          const acct = USERS.find(u => u.codename === user.codename)
          if (acct && acct.status && acct.status !== 'active') {
            showToast('⚠ Session terminated'); setTimeout(handleLogout, 1500)
          }
        }
      } catch {}
    }, 30000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, user])

  // ── Login screen ──
  if (phase === 'login') {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastProvider />
      </>
    )
  }

  // ── Boot screen ──
  if (phase === 'boot') {
    return (
      <div className="fixed inset-0 bg-[#07090F] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#0C0F1A] border border-[#28304E] flex items-center justify-center mb-6
          shadow-[0_0_40px_rgba(63,111,232,0.15)] relative">
          <div className="absolute inset-[-8px] border border-blue-950 rounded-full animate-spin" style={{ animationDuration: '12s' }} />
          <img src="/rblxnsanet/nsa-seal.png" alt="NSA" className="w-full h-full rounded-full object-contain" />
        </div>
        <div className="text-[18px] font-bold text-slate-100 tracking-[0.08em] mb-1">NSANET</div>
        <div className="font-mono text-[10px] text-slate-500 tracking-[0.12em] mb-7">NATIONAL SECURITY AGENCY // SECURE INTRANET</div>
        <div className="w-[440px] font-mono text-[11px] text-slate-500 leading-[2]">
          {bootLines.map((l, i) => (
            <div key={i} className="transition-opacity duration-150">{'> '}{l}</div>
          ))}
        </div>
        <div className="w-[440px] h-px bg-[#1E2540] mt-5 overflow-hidden rounded-full">
          <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: bootPct + '%' }} />
        </div>
      </div>
    )
  }

  // ── Portal ──
  const paneMap: Record<string, React.ReactNode> = {
    overview:  <Overview  user={user!} accounts={accounts} staffData={[]} />,
    staff:     <Staff     user={user!} accounts={accounts} />,
    chat:      <Comms     user={user!} />,
    files:     <FileVault user={user!} />,
    accounts:  <Accounts  user={user!} accounts={accounts} setAccounts={setAccounts} />,
    ant:       <ANTCatalog />,
    awards:    <Awards    user={user!} />,
    tao:       <TAO user={user!} />,
    analytics: <Analytics user={user!} />,
    scs:       <SCS user={user!} />,
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07090F]">
      <ClassBanner line={PANE_CLASS[pane] || DEFAULT_CLASS} />
      <Topbar user={user!} sessionId={sessionId ?? ''} onLogout={handleLogout} onGoBar={() => setGoOpen(true)} />

      <div className="flex-1 overflow-hidden flex">
        <Sidebar user={user!} active={pane} onNavigate={navigate} onRestricted={handleRestricted} />
        <main className="flex-1 overflow-y-auto p-6">
          {paneMap[pane] ?? paneMap['overview']}
        </main>
      </div>

      <ClassBanner bottom line={PANE_CLASS[pane] || DEFAULT_CLASS} />

      <GoBar open={goOpen} onClose={() => setGoOpen(false)}
        onNavigate={navigate} onRestricted={handleRestricted} user={user!} />

      {accessRoute && (
        <AccessCode route={accessRoute} onSuccess={onAccessSuccess}
          onCancel={() => { setAccessRoute(null); setPendingRoute(null) }} />
      )}
      <ToastProvider />
    </div>
  )
}
