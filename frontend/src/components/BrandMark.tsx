interface BrandMarkProps {
  size?: number;
}

/** AIBI mark: a ruled ledger sheet with an amber flag on the latest line. */
export default function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="var(--p-600)" />
      <path d="M8 11h16M8 16h16M8 21h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <rect x="20" y="19" width="5" height="4" rx="1" fill="var(--mark)" />
    </svg>
  );
}
