import React, { useState, useRef, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { ACCESS_CODES } from '../data/auth'
import type { GoRoute } from '../data/auth'
import { Btn } from './UI'

interface AccessCodeProps {
  route:     GoRoute
  onSuccess: () => void
  onCancel:  () => void
}

export default function AccessCode({ route, onSuccess, onCancel }: AccessCodeProps) {
  const [code,     setCode]     = useState('')
  const [err,      setErr]      = useState('')
  const [attempts, setAttempts] = useState(3)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])

  function submit() {
    const correct = ACCESS_CODES[route.pane]
    if (!correct) { onSuccess(); return }
    if (code.toUpperCase() === correct.toUpperCase()) {
      setErr(''); onSuccess()
    } else {
      const left = attempts - 1
      setAttempts(left)
      setCode('')
      setErr('Invalid access code. Attempt logged.')
      if (left <= 0) setTimeout(onCancel, 1500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5500] flex items-center justify-center">
      <div className="w-[360px] max-w-[92vw] bg-[#0C0F1A] border border-[#28304E] rounded-xl p-8 text-center shadow-2xl">
        <div className="w-13 h-13 rounded-full border border-[#28304E] bg-[#111627] flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-blue-500" />
        </div>
        <div className="text-[16px] font-bold text-slate-100 mb-0.5">Access Code Required</div>
        <div className="font-mono text-[9px] text-slate-500 tracking-[0.15em] mb-2">RESTRICTED RESOURCE — SECONDARY AUTHENTICATION</div>
        <div className="inline-block font-mono text-[11px] text-blue-400 bg-blue-950/50 border border-blue-800/40 rounded px-3 py-1 mb-5">
          {route.label}
        </div>

        {err && (
          <div className="bg-red-950/50 border border-red-800/40 rounded text-red-400 text-[11px] px-3 py-2 mb-3">{err}</div>
        )}

        <input ref={inputRef} type="password" value={code} onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full bg-[#111627] border border-[#28304E] rounded px-3.5 py-2.5 text-blue-400
            font-mono text-[18px] tracking-[0.3em] text-center outline-none transition-all mb-3
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="• • • • • •" maxLength={30} />

        <Btn onClick={submit} className="w-full justify-center mb-2">
          <Lock size={13} /> Authenticate
        </Btn>
        <Btn variant="ghost" onClick={onCancel} className="w-full justify-center">Cancel</Btn>

        <div className="font-mono text-[9px] text-slate-600 mt-3 tracking-[0.1em]">
          {attempts} ATTEMPT{attempts !== 1 ? 'S' : ''} REMAINING
        </div>
      </div>
    </div>
  )
}
