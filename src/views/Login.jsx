import React, { useState, useRef, useEffect } from 'react'
import { LogIn } from 'lucide-react'
import { ClassBanner } from '../components/UI.jsx'
import { USERS } from '../data/auth.js'
const nsaSeal = '/rblxnsanet/nsa-seal.png'

export default function Login({ onLogin, errorMsg = '' }) {
  const [code, setCode]     = useState('')
  const [pass, setPass]     = useState('')
  const [err, setErr]       = useState(errorMsg)
  const codeRef = useRef(null)

  useEffect(() => { setErr(errorMsg) }, [errorMsg])
  useEffect(() => { setTimeout(() => codeRef.current?.focus(), 100) }, [])

  function attempt() {
    const raw      = code.trim().toUpperCase()
    const codename = raw.includes('@') ? raw.split('@')[0] : raw
    if (raw.includes('@') && raw.split('@')[1] !== 'NSA.RBLX.GOV') {
      setErr('Invalid domain. Use @nsa.rblx.gov'); return
    }
    if (!codename || !pass) { setErr('Enter your username and password'); return }
    const user = USERS.find(u => u.codename === codename && u.pass === pass)
    if (!user) { setErr('Invalid credentials. Access denied.'); setPass(''); return }
    setErr('')
    onLogin(codename, pass)
  }

  return (
    <div className="fixed inset-0 bg-[#07090F] flex flex-col">
      <ClassBanner />
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto p-6">
        <div className="w-[400px] bg-[#0C0F1A] border border-[#28304E] rounded-xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex flex-col items-center border-b border-[#1E2540]">
            <div className="w-[72px] h-[72px] rounded-full bg-[#111627] border border-[#28304E]
              flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(63,111,232,0.15)]">
              <img src={nsaSeal} alt="NSA Seal" className="w-full h-full rounded-full object-contain" />
            </div>
            <div className="text-[16px] font-bold text-slate-100 tracking-[0.04em]">NSANET</div>
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">NATIONAL SECURITY AGENCY // SECURE INTRANET</div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {err && (
              <div className="bg-red-950/50 border border-red-800/50 rounded text-red-400 text-xs px-3 py-2.5 mb-4">
                ⚠ {err}
              </div>
            )}

            <div className="mb-3.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">
                NSA Username
              </label>
              <input ref={codeRef} value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && attempt()}
                placeholder="" type="text" autoComplete="off" readOnly
                onFocus={e => e.target.removeAttribute('readOnly')}
                className="w-full bg-[#111627] border border-[#28304E] rounded text-sm
                  text-slate-100 px-3 py-2 outline-none transition-all
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">
                Password
              </label>
              <input value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && attempt()}
                type="password" autoComplete="off" readOnly
                onFocus={e => e.target.removeAttribute('readOnly')}
                className="w-full bg-[#111627] border border-[#28304E] rounded text-sm
                  text-slate-100 px-3 py-2 outline-none transition-all
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
            </div>

            <button onClick={attempt}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                text-xs font-semibold uppercase tracking-[0.04em] py-2.5 rounded
                hover:bg-blue-700 transition-all hover:shadow-[0_0_16px_rgba(63,111,232,0.3)]">
              <LogIn size={13} />
              Sign in to NSANET
            </button>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
              UNAUTHORIZED ACCESS IS PROHIBITED<br />
              USE OF THIS SYSTEM CONSTITUTES CONSENT TO MONITORING
            </p>
          </div>
        </div>
      </div>
      <ClassBanner bottom />
    </div>
  )
}
