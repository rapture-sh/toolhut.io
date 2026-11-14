import { cn } from "~/lib/utils";

interface RaptureWordmarkProps {
  className?: string;
}

/**
 * The official Rapture wordmark from rapture.sh/brand, painted through a mask
 * so its fill can be animated. Give it a height; the width follows.
 */
export function RaptureWordmark({ className }: RaptureWordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Rapture"
      className={cn("rapture-wordmark", className)}
    />
  );
}
