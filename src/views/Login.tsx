import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { authenticateUser } from '../data/users'
import type { User } from '../data/auth'

interface LoginProps {
  onLogin: (u: User, sid: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [codename, setCodename] = useState('')
  const [pass,     setPass]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!codename || !pass) { setError('All fields required.'); return }
    setLoading(true); setError('')

    try {
      const found = await authenticateUser(codename, pass)
      if (!found) {
        setError('ACCESS DENIED — Invalid codename or passphrase.')
        return
      }
      if (found.status !== 'active') {
        setError('ACCESS DENIED — Account suspended or revoked.')
        return
      }
      onLogin(found, crypto.randomUUID())
    } catch {
      setError('Authentication error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col">
      {/* Top banner */}
      <div className="h-6 bg-orange-700 flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[11px] font-bold text-white tracking-[0.12em]">
          TOP SECRET//COMINT-G//NOFORN/ORCON
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
              bg-[#0C0F1A] border border-[#1E2540] mb-5 shadow-[0_0_32px_rgba(63,111,232,0.12)]">
              <img src="/rblxnsanet/nsa-seal.png" alt="NSA" className="w-full h-full rounded-full object-contain p-1" />
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-[0.15em] mb-1">NSANET</div>
            <div className="text-[11px] font-mono text-slate-500 tracking-[0.1em]">
              NATIONAL SECURITY AGENCY — INTERNAL NETWORK
            </div>
            <div className="text-[10px] font-mono text-slate-600 tracking-[0.08em] mt-1">
              CLASSIFIED SYSTEM · AUTHORIZED USE ONLY
            </div>
          </div>

          {/* Card */}
          <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl p-8 shadow-2xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-6">
              Authentication Required
            </div>

            {error && (
              <div className="bg-red-950/60 border border-red-800/50 rounded-lg px-4 py-3 mb-5
                text-red-400 text-sm font-mono">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase
                  tracking-[0.08em] mb-2">Codename</label>
                <input
                  value={codename}
                  onChange={e => setCodename(e.target.value)}
                  placeholder="Enter codename"
                  autoFocus
                  className="w-full bg-[#111627] border border-[#28304E] rounded-lg px-4 py-3
                    text-slate-100 text-sm outline-none transition-all
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                    placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase
                  tracking-[0.08em] mb-2">Passphrase</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="Enter passphrase"
                    className="w-full bg-[#111627] border border-[#28304E] rounded-lg px-4 py-3
                      text-slate-100 text-sm outline-none transition-all pr-11
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                      placeholder:text-slate-600"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                      hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600
                  hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm
                  uppercase tracking-[0.06em] py-3 rounded-lg transition-all mt-2
                  hover:shadow-[0_0_20px_rgba(63,111,232,0.3)] cursor-pointer border-none">
                <Lock size={14} />
                {loading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#1E2540] space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
                END-TO-END ENCRYPTED · TLS 1.3
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE — 18 U.S.C. § 1030
              </div>
            </div>
          </div>

          <div className="text-center mt-4 text-[10px] font-mono text-slate-700">
            NSANET PORTAL v3.2 · NSA/CSS · FORT MEADE, MD
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="h-6 bg-orange-700 flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[11px] font-bold text-white tracking-[0.12em]">
          TOP SECRET//COMINT-G//NOFORN/ORCON
        </span>
      </div>
    </div>
  )
}
