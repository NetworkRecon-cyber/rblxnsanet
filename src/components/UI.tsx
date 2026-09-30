import React from 'react'
import { CLASS_LINE, ROLE_LABELS } from '../data/auth'

// ── Classification Banner ──
interface ClassBannerProps { bottom?: boolean; line?: string }
export function ClassBanner({ bottom = false, line }: ClassBannerProps) {
  return (
    <div className={`flex-shrink-0 h-5 flex items-center justify-center
      bg-orange-700 border-orange-900 font-mono text-[10px] font-bold
      text-white tracking-[0.06em] select-none z-50
      ${bottom ? 'border-t' : 'border-b'}`}>
      {line || CLASS_LINE}
    </div>
  )
}

// ── Badge ──
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'dim'
const BADGE_STYLES: Record<BadgeVariant, string> = {
  green: 'bg-green-950 text-green-400 border-green-800',
  amber: 'bg-amber-950 text-amber-400 border-amber-800',
  red:   'bg-red-950 text-red-400 border-red-800',
  blue:  'bg-blue-950 text-blue-400 border-blue-800',
  dim:   'bg-[#111627] text-slate-400 border-[#1E2540]',
}
interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string }
export function Badge({ variant = 'dim', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold
      tracking-[0.08em] uppercase font-mono border ${BADGE_STYLES[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ── Pill (status) ──
type PillVariant = 'active' | 'suspend' | 'revoked'
const PILL_STYLES: Record<PillVariant, string> = {
  active:  'bg-green-950 text-green-400 border-green-800',
  suspend: 'bg-amber-950 text-amber-400 border-amber-800',
  revoked: 'bg-red-950 text-red-400 border-red-800',
}
interface PillProps { variant?: PillVariant; children: React.ReactNode }
export function Pill({ variant = 'active', children }: PillProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px]
      font-bold tracking-[0.08em] uppercase font-mono border ${PILL_STYLES[variant]}`}>
      {children}
    </span>
  )
}

// ── Role Badge ──
interface RoleBadgeProps { role: string }
export function RoleBadge({ role }: RoleBadgeProps) {
  const cfg = ROLE_LABELS[role] || ROLE_LABELS['liaison']
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px]
      font-bold tracking-[0.1em] uppercase border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ── Button ──
type BtnVariant = 'primary' | 'ghost' | 'danger'
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  className?: string
}
export function Btn({ variant = 'primary', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-[0.04em] transition-all cursor-pointer border-none'
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_0_16px_rgba(63,111,232,0.3)]',
    ghost:   'bg-transparent text-slate-300 border border-[#28304E] hover:border-blue-500 hover:text-blue-400',
    danger:  'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Icon Button ──
interface IconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  red?: boolean; className?: string
}
export function IconBtn({ red = false, className = '', children, ...props }: IconBtnProps) {
  return (
    <button className={`w-7 h-7 flex items-center justify-center rounded border
      border-[#1E2540] text-slate-500 transition-all cursor-pointer bg-transparent
      ${red ? 'hover:border-red-600 hover:text-red-400 hover:bg-red-950'
             : 'hover:border-blue-500 hover:text-blue-400 hover:bg-blue-950'}
      ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Card ──
interface CardProps { className?: string; children: React.ReactNode }
export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-[#0C0F1A] border border-[#1E2540] rounded-md p-4 mb-3 ${className}`}>
      {children}
    </div>
  )
}
interface CardHeadProps { children: React.ReactNode; className?: string }
export function CardHead({ children, className = '' }: CardHeadProps) {
  return (
    <div className={`text-[11px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-3 ${className}`}>
      {children}
    </div>
  )
}

// ── Modal ──
// Awards.tsx passes children directly without open prop, so we support both signatures
interface ModalProps {
  open?: boolean
  onClose?: () => void
  title?: string
  sub?: string
  children: React.ReactNode
  width?: string
}
export function Modal({ open, onClose, title, sub, children, width = 'max-w-lg' }: ModalProps) {
  // If open is explicitly false, hide. If open is undefined (used without the prop), always show.
  if (open === false) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[5000] flex items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className={`bg-[#0C0F1A] border border-[#28304E] rounded-xl p-7 w-full ${width} shadow-2xl`}>
        {title && <div className="text-[16px] font-bold text-slate-100 mb-1">{title}</div>}
        {sub   && <div className="font-mono text-[10px] text-slate-500 tracking-[0.04em] mb-5">{sub}</div>}
        {children}
      </div>
    </div>
  )
}

// ── Form Field ──
interface FieldProps { label?: string; children: React.ReactNode }
export function Field({ label, children }: FieldProps) {
  return (
    <div className="mb-3.5">
      {label && <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">{label}</label>}
      {children}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { className?: string }
export function Input({ className = '', ...props }: InputProps) {
  return (
    <input className={`w-full bg-[#111627] border border-[#28304E] rounded text-sm
      text-slate-100 px-3 py-2 outline-none transition-all
      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${className}`}
      {...props} />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { className?: string }
export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select className={`w-full bg-[#111627] border border-[#28304E] rounded text-sm
      text-slate-100 px-3 py-2 outline-none transition-all appearance-none cursor-pointer
      focus:border-blue-500 ${className}`}
      {...props}>
      {children}
    </select>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { className?: string }
export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea className={`w-full bg-[#111627] border border-[#28304E] rounded text-sm
      text-slate-100 px-3 py-2 outline-none transition-all resize-y min-h-[90px]
      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${className}`}
      {...props} />
  )
}

// ── Stat Card ──
interface StatCardProps { num: number | string; label: string; color?: string }
export function StatCard({ num, label, color = 'text-blue-400' }: StatCardProps) {
  return (
    <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-md p-4">
      <div className={`text-[28px] font-bold leading-none mb-1.5 tracking-tight ${color}`}>{num}</div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.05em]">{label}</div>
    </div>
  )
}

// ── Feed Row ──
type DotColor = 'g' | 'a' | 'r' | 'b'
const DOT_COLORS: Record<DotColor, string> = { g: 'bg-green-500', a: 'bg-amber-500', r: 'bg-red-500', b: 'bg-blue-500' }
interface FeedRowProps { time: string; dot?: DotColor; msg: string; tag?: string; tagVariant?: BadgeVariant }
export function FeedRow({ time, dot = 'g', msg, tag, tagVariant = 'dim' }: FeedRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#1E2540] last:border-0 text-xs">
      <span className="font-mono text-slate-500 text-[11px] flex-shrink-0 w-12 mt-0.5">{time}</span>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${DOT_COLORS[dot]}`} />
      <span className="flex-1 text-slate-300">{msg}</span>
      {tag && <Badge variant={tagVariant}>{tag}</Badge>}
    </div>
  )
}

// ── Toast (imperative) ──
let _setToast: React.Dispatch<React.SetStateAction<string | null>> | null = null

export function ToastProvider() {
  const [msg, setMsg] = React.useState<string | null>(null)
  _setToast = setMsg
  React.useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2800)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <div className={`fixed bottom-6 right-6 z-[9000] max-w-xs bg-[#111627] border border-[#28304E]
      rounded-md px-4 py-3 text-sm text-slate-100 shadow-2xl transition-all duration-300
      ${msg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      {msg}
    </div>
  )
}
export function showToast(msg: string) { _setToast?.(msg) }
