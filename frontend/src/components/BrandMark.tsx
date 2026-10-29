interface BrandMarkProps {
  size?: number;
}

/** AIBI mark: ink tile with rising bars, the latest one in amber. Matches public/favicon.svg. */
export default function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="brandmark-ink" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f56a3" />
          <stop offset="1" stopColor="#16295a" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#brandmark-ink)" />
      <rect x="13" y="35" width="10" height="16" rx="2.5" fill="#fff" fillOpacity="0.72" />
      <rect x="27" y="26" width="10" height="25" rx="2.5" fill="#fff" />
      <rect x="41" y="14" width="10" height="37" rx="2.5" fill="var(--mark)" />
    </svg>
  );
}
