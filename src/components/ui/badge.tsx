import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

// Build a tinted badge style from a hex color (light bg + solid text).
export function tintStyle(hex: string): React.CSSProperties {
  return { backgroundColor: `${hex}1A`, color: hex };
}
