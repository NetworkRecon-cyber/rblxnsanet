import React, { useState, useEffect, useCallback } from 'react'
import { ClassBanner, ToastProvider, showToast } from './components/UI.jsx'
import Topbar from './components/Topbar.jsx'
import GoBar  from './components/GoBar.jsx'
import AccessCode from './components/AccessCode.jsx'
import Login    from './views/Login.jsx'
import Overview from './views/Overview.jsx'
import Staff    from './views/Staff.jsx'
import Comms    from './views/Comms.jsx'
import FileVault from './views/FileVault.jsx'
import Accounts  from './views/Accounts.jsx'
import { TAO, Analytics } from './views/Restricted.jsx'
import { SCS } from './views/SCS_CNO.jsx'
import { hasPermission, GO_ROUTES, USERS } from './data/auth.js'
import { apiLogin, apiLogout, apiRestoreSession, apiHeartbeat } from './data/api.js'

// ── Pane classification lines ──
const PANE_CLASS = {
  scs:       'TOP SECRET//COMINT//COMINT-STATEROOM//ORCON/NOFORN',
  tao:       'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN',
  analytics: 'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN',
}
const DEFAULT_CLASS = 'TOP SECRET//COMINT//TALENT KEYHOLE//ORCON/NOFORN'

// ── Watermark utilities ──
function seededRandom(seed) {
  let s = seed
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function strToSeed(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0
  return Math.abs(hash)
}
function generateSID() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return 'SID-' + ts + '-' + rand
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

export default function App() {
  const [phase, setPhase]   = useState('login')   // login | boot | portal
  const [user,  setUser]    = useState(null)
  const [pane,  setPane]    = useState('overview')
  const [loginErr, setLoginErr] = useState('')
  const [goOpen,   setGoOpen]   = useState(false)
  const [accounts, setAccounts] = useState([])
  const [sessionId, setSessionId] = useState(null)

  // Restore session on page load — try API first, fall back to sessionStorage
  useEffect(() => {
    async function restore() {
      try {
        const data = await apiRestoreSession()
        if (data) {
          setUser(data.user)
          setSessionId(data.sessionId)
          setPhase('portal')
          const go = new URLSearchParams(window.location.search).get('go')
          if (go && GO_ROUTES[go.toLowerCase()]) {
            const route = GO_ROUTES[go.toLowerCase()]
            if (route.restricted) { setAccessRoute(route); setPendingRoute(route) }
            else setPane(route.pane)
          }
          return
        }
      } catch {}
      // Fall back to sessionStorage
      const stored = sessionStorage.getItem('nsanet_user')
      const sid    = sessionStorage.getItem('nsanet_sid')
      if (stored) {
        try {
          const u = JSON.parse(stored)
          setUser(u); setSessionId(sid); setPhase('portal')
          const go = new URLSearchParams(window.location.search).get('go')
          if (go && GO_ROUTES[go.toLowerCase()]) {
            const route = GO_ROUTES[go.toLowerCase()]
            if (route.restricted) { setAccessRoute(route); setPendingRoute(route) }
            else setPane(route.pane)
          }
        } catch {}
      }
    }
    restore()
  }, [])

  // Restricted pane access
  const [accessRoute,   setAccessRoute]   = useState(null)
  const [pendingRoute,  setPendingRoute]  = useState(null)

  // Boot state
  const [bootLines, setBootLines]  = useState([])
  const [bootPct,   setBootPct]    = useState(0)

  // ── Login ──
  async function handleLogin(codename, pass) {
    // Try API first, fall back to local USERS if backend unreachable
    let user = null
    let sid  = generateSID()
    try {
      const data = await apiLogin(codename, pass, sid)
      user = data.user
      sid  = data.sessionId
    } catch(e) {
      // Backend unreachable — fall back to local auth
      const localUser = USERS.find(u => u.codename === codename && u.pass === pass)
      if (!localUser) { setLoginErr(e.message || 'Invalid credentials. Access denied.'); return }
      if (localUser.status && localUser.status !== 'active') { setLoginErr('Account ' + localUser.status); return }
      user = localUser
    }
    if (!user) { setLoginErr('Invalid credentials. Access denied.'); return }
    sessionStorage.setItem('nsanet_user', JSON.stringify(user))
    sessionStorage.setItem('nsanet_sid', sid)
    setUser(user)
    setSessionId(sid)
    setLoginErr('')
    setPhase('boot')
    setBootLines([])
    setBootPct(0)
    let idx = 0
    function next() {
      if (idx >= BOOT_LINES.length) {
        injectWatermarks(user.codename, sid)
        const stored = sessionStorage.getItem('nsanet_pending_go')
        if (stored && GO_ROUTES[stored]) {
          const route = GO_ROUTES[stored]
          sessionStorage.removeItem('nsanet_pending_go')
          setPhase('portal')
          if (route.restricted) { setAccessRoute(route); setPendingRoute(route) }
          else setPane(route.pane)
        } else {
          setPhase('portal')
        }
        return
      }
      const line = BOOT_LINES[idx]
      setBootLines(prev => [...prev, line])
      setBootPct(Math.round(((idx + 1) / BOOT_LINES.length) * 100))
      idx++
      setTimeout(next, 310)
    }
    setTimeout(next, 400)
  }

  // ── Watermarks ──
  function injectWatermarks(codename, sid) {
    // Pixel watermark
    document.querySelectorAll('.__nsanet_wm,.__nsanet_px').forEach(e => e.remove())
    const bits = sid.split('').flatMap(c => {
      const b = c.charCodeAt(0)
      return Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1)
    })
    const sync = [1,0,1,0,1,0,1,0,1,1,1,1,0,0,0,0]
    const allBits = [...sync, ...bits]
    const wm = document.createElement('canvas')
    wm.className = '__nsanet_wm'
    wm.width = allBits.length; wm.height = 2
    wm.style.cssText = `position:fixed;bottom:0;left:0;width:${allBits.length}px;height:2px;opacity:0.004;pointer-events:none;z-index:2147483647;image-rendering:pixelated;`
    const ctx = wm.getContext('2d')
    allBits.forEach((bit, x) => { ctx.fillStyle = bit ? 'rgba(1,0,0,1)' : 'rgba(0,0,0,1)'; ctx.fillRect(x, 0, 1, 2) })
    document.body.appendChild(wm)

    // Scattered pixels (seeded by codename)
    const rng = seededRandom(strToSeed(codename))
    const pbits = codename.split('').flatMap(c => Array.from({ length: 8 }, (_, i) => (c.charCodeAt(0) >> (7-i)) & 1))
    for (let i = 0; i < 50; i++) {
      const px = document.createElement('canvas')
      px.className = '__nsanet_px'
      px.width = 1; px.height = 1
      px.style.cssText = `position:fixed;left:${(rng()*98+1).toFixed(3)}%;top:${(rng()*98+1).toFixed(3)}%;width:1px;height:1px;opacity:0.008;pointer-events:none;z-index:2147483640;image-rendering:pixelated;`
      const c2 = px.getContext('2d')
      c2.fillStyle = pbits[i % pbits.length] ? 'rgba(2,0,0,1)' : 'rgba(0,0,2,1)'
      c2.fillRect(0,0,1,1)
      document.body.appendChild(px)
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
    setPane('overview'); setLoginErr(''); setGoOpen(false)
    setAccessRoute(null); setPendingRoute(null)
  }

  // ── Navigate ──
  function navigate(key) {
    if (!hasPermission(user, 'staffView') && key === 'staff') { showToast('ACCESS DENIED'); return }
    if (!hasPermission(user, 'vaultView') && key === 'files') { showToast('ACCESS DENIED'); return }
    if (!hasPermission(user, 'acctView')  && key === 'accounts') { showToast('ACCESS DENIED'); return }
    setPane(key)
  }

  function handleRestricted(key) {
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
    const log = []
    function detect(method) {
      log.push({ method, sid: sessionId, user: user?.codename, time: new Date().toUTCString() })
      showToast('⚠ SCREENSHOT DETECTED — Attempt logged')
      console.warn('[NSANET SECURITY]', log[log.length-1])
    }
    function onKey(e) {
      if (e.key === 'PrintScreen' || e.key === 'F13' || (e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key))) detect('KEYBOARD')
    }
    function onCopy(e) { if (!window.getSelection()?.toString()) detect('CLIPBOARD') }
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
    window.nsanetScreenshotLog = () => { console.table(log); return log }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('copy', onCopy)
      window.removeEventListener('focus', onFocus)
    }
  }, [phase, user, sessionId])

  // ── Ctrl+K ──
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && phase === 'portal') {
        e.preventDefault(); setGoOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // ── ?go= param (handled in session restore + post-boot) ──

  // ── Session heartbeat ──
  useEffect(() => {
    if (phase !== 'portal' || !user) return
    const t = setInterval(async () => {
      try {
        const ok = await apiHeartbeat()
        if (!ok) { showToast('⚠ Session expired'); setTimeout(handleLogout, 1500) }
      } catch {
        // Backend unreachable — check local
        if (user.role !== 'admin') {
          const acct = USERS.find(u => u.codename === user.codename)
          if (acct && acct.status && acct.status !== 'active') {
            showToast('⚠ Session terminated'); setTimeout(handleLogout, 1500)
          }
        }
      }
    }, 15000)
    return () => clearInterval(t)
  }, [phase, user])

  // ── Render ──
  if (phase === 'login') {
    return (
      <>
        <Login onLogin={(codename, pass) => handleLogin(codename, pass)} errorMsg={loginErr} />
        <ToastProvider />
      </>
    )
  }

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
  const paneMap = {
    overview:  <Overview  user={user} accounts={accounts} staffData={[]} />,
    staff:     <Staff     accounts={accounts} />,
    chat:      <Comms     user={user} />,
    files:     <FileVault user={user} />,
    accounts:  <Accounts  user={user} accounts={accounts} setAccounts={setAccounts} />,
    tao:       <TAO />,
    analytics: <Analytics />,
    scs:       <SCS />,
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07090F]">
      <ClassBanner line={PANE_CLASS[pane] || DEFAULT_CLASS} />
      <Topbar user={user} sessionId={sessionId} onLogout={handleLogout} onGoBar={() => setGoOpen(true)} />
      <div className="flex-1 overflow-hidden flex">
        {paneMap[pane] || paneMap.overview}
      </div>
      <ClassBanner bottom line={PANE_CLASS[pane] || DEFAULT_CLASS} />

      <GoBar open={goOpen} onClose={() => setGoOpen(false)}
        onNavigate={navigate} onRestricted={handleRestricted} user={user} />

      {accessRoute && (
        <AccessCode route={accessRoute} onSuccess={onAccessSuccess} onCancel={() => { setAccessRoute(null); setPendingRoute(null) }} />
      )}

      <ToastProvider />
    </div>
  )
}
