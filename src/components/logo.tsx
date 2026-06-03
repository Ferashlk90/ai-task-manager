import { cn } from "@/lib/utils";

/**
 * App logo — the same mark used for the favicon / app icon
 * (see src/app/icon.svg): a white checkmark on a dark rounded tile.
 * Rendered inline so it stays crisp at any size and reads on both themes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("size-7", className)}
      role="img"
      aria-hidden
    >
      <rect width="512" height="512" rx="116" fill="#14171a" />
      <path
        d="M148 270 L222 344 L366 168"
        fill="none"
        stroke="#ffffff"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
