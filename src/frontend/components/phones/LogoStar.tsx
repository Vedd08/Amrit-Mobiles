import * as React from "react";
import { cn } from "@/frontend/lib/utils";

export function LogoStar({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <defs>
        <linearGradient id="logo-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-steel-lo)" />
          <stop offset="100%" stopColor="var(--color-steel)" />
        </linearGradient>
      </defs>
      <path
        d="M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0 Z"
        fill="url(#logo-star-grad)"
      />
    </svg>
  );
}
