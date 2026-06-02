import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-fg placeholder:text-faint outline-none transition-colors focus:border-muted focus:ring-2 focus:ring-ring-soft/70",
        className,
      )}
      {...props}
    />
  );
});
