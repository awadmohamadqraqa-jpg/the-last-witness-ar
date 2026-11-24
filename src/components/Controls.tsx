import { motion } from 'motion/react'
import { Check, ChevronLeft, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------ Toggle */
interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
  id: string
}

export function SettingsToggle({ checked, onChange, label, hint, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-[2px] border border-surveil/15 bg-surface/40 px-3.5 py-3 transition-colors hover:border-surveil/35"
    >
      <span className="min-w-0">
        <span className="block text-[13px] text-fg">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-fg-dim">{hint}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'block h-5 w-9 rounded-full border transition-colors',
            checked ? 'border-surveil bg-surveil/30' : 'border-fg-dim/30 bg-ink',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full transition-all',
            checked ? 'right-0.5 bg-surveil' : 'right-[18px] bg-fg-dim/50',
          )}
          aria-hidden="true"
        />
      </span>
    </label>
  )
}

/* ------------------------------------------------------------------ Modal */
interface ConfirmProps {
  open: boolean
  title: string
  body?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  tone?: 'danger' | 'cold'
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = 'danger',
}: ConfirmProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/85 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="panel w-full max-w-sm rounded-[3px] p-5 text-right"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="إغلاق"
            className="text-fg-dim transition-colors hover:text-fg"
          >
            <X size={16} />
          </button>
        </div>
        {body && <p className="mb-5 text-[13px] leading-relaxed text-fg-dim">{body}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 text-xs">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn('btn flex-1 text-xs', tone === 'danger' ? 'btn-primary' : '')}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* --------------------------------------------------------------- PageLink */
interface BackLinkProps {
  onClick: () => void
  label: string
  className?: string
}

export function BackLink({ onClick, label, className }: BackLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group inline-flex items-center gap-1.5 text-[12px] text-fg-dim transition-colors hover:text-fg',
        className,
      )}
    >
      <ChevronLeft size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ Badge */
export function Badge({ children, tone = 'cold' }: { children: ReactNode; tone?: 'cold' | 'danger' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-[10px] tracking-[0.16em]',
        tone === 'danger' && 'border-danger/50 bg-danger/10 text-danger-soft',
        tone === 'cold' && 'border-surveil/40 bg-surveil/5 text-surveil',
        tone === 'muted' && 'border-fg-dim/25 text-fg-dim',
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------- CheckRow */
export function CheckRow({ children, done }: { children: ReactNode; done?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-[12px] leading-relaxed text-fg-dim">
      <span
        className={cn(
          'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
          done ? 'border-surveil/60 text-surveil' : 'border-fg-dim/30 text-transparent',
        )}
        aria-hidden="true"
      >
        <Check size={9} />
      </span>
      <span className={done ? 'text-fg/85' : undefined}>{children}</span>
    </li>
  )
}
