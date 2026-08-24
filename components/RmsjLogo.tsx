interface RmsjLogoProps {
  className?: string;
  size?: number;
}

export default function RmsjLogo({
  className = "",
  size = 48,
}: RmsjLogoProps) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="RSRE"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
