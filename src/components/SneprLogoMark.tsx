export function SneprLogoMark({ className, color = "currentColor", height = 28 }: { className?: string, color?: string, height?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={height}
      height={height}
      className={className}
      role="img"
      aria-label="Snepr Mark"
      fill="none"
    >
      <path
        d="M24 10c-2-2-6-3-9-2s-5 4-3 6 5 2 8 3 8 2 8 5-2 6-7 7-10-1-12-3"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
