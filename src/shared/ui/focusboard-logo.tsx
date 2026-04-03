import { cn } from "@/shared/lib/cn";

interface FocusBoardLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
}

export function FocusBoardLogo({
  className,
  markClassName,
  textClassName,
  compact = false,
}: FocusBoardLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={cn("h-11 w-11 shrink-0", markClassName)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="56" height="56" rx="16" fill="#111111" />
        <path
          d="M18 20H46C47.1046 20 48 20.8954 48 22V24C48 25.1046 47.1046 26 46 26H18C16.8954 26 16 25.1046 16 24V22C16 20.8954 16.8954 20 18 20Z"
          fill="#F4F0E6"
        />
        <path
          d="M18 30H38C39.1046 30 40 30.8954 40 32V34C40 35.1046 39.1046 36 38 36H18C16.8954 36 16 35.1046 16 34V32C16 30.8954 16.8954 30 18 30Z"
          fill="#F4F0E6"
          opacity="0.92"
        />
        <path
          d="M18 40H34C35.1046 40 36 40.8954 36 42V44C36 45.1046 35.1046 46 34 46H18C16.8954 46 16 45.1046 16 44V42C16 40.8954 16.8954 40 18 40Z"
          fill="#F4F0E6"
          opacity="0.84"
        />
        <circle cx="45" cy="42" r="7" fill="#8FAA95" />
        <circle cx="45" cy="42" r="3" fill="#111111" />
      </svg>
      <div className={cn("min-w-0", textClassName)}>
        <div className={cn("text-sm font-semibold uppercase tracking-[0.26em] text-ink-950/42", compact && "text-[10px]")}>
          FocusBoard
        </div>
        <div className={cn("text-base font-semibold text-ink-950", compact && "text-sm")}>
          Спокойное пространство для решений
        </div>
      </div>
    </div>
  );
}
