interface RmsjLogoProps {
  className?: string
}

export default function RmsjLogo({ className = '' }: RmsjLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-3xl bg-slate-950 text-sm font-semibold tracking-[0.12em] text-cyan-200 shadow-soft ${className}`}
    >
      RSJH
    </span>
  )
}
