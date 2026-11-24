import { cn } from '@/lib/cn'

interface BrandMarkProps {
  /** 'hero' on the landing page, 'compact' in the HUD. */
  size?: 'hero' | 'compact'
  ar: string
  latin: string
  className?: string
}

/** THE LAST WITNESS lockup — the only Latin text in the interface. */
export function BrandMark({ size = 'hero', ar, latin, className }: BrandMarkProps) {
  if (size === 'compact') {
    return (
      <div className={cn('flex items-center gap-2.5 select-none', className)}>
        <span className="relative grid h-6 w-6 place-items-center border border-surveil/50">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          <span className="absolute inset-0 border border-surveil/15" />
        </span>
        <span className="brand-latin text-[9px] leading-none text-surveil">{latin}</span>
      </div>
    )
  }

  return (
    <div className={cn('select-none text-center', className)}>
      <div className="mb-3 flex items-center justify-center gap-3 text-surveil">
        <span className="h-px w-10 bg-surveil/40" />
        <span className="brand-latin text-[10px] sm:text-[11px]">{latin}</span>
        <span className="h-px w-10 bg-surveil/40" />
      </div>
      <h1
        className="title-shadow text-2xl font-semibold tracking-[0.08em] text-fg sm:text-3xl"
        style={{ letterSpacing: '0.06em' }}
      >
        {ar}
      </h1>
    </div>
  )
}

export default BrandMark
