import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
}

export function Surface({
  children,
  className,
  muted = false,
  ...props
}: PropsWithChildren<SurfaceProps>) {
  return (
    <div
      className={cn(
        "panel-surface",
        muted ? "bg-mist-50" : "bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
