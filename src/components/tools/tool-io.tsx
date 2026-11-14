"use client";

import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={value === ""}
      onClick={() => copy(value)}
      className={cn("text-muted-foreground", className)}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

interface ToolPanesProps {
  children: ReactNode;
}

/** Side by side on a laptop, stacked on a phone. Every tool uses this. */
export function ToolPanes({ children }: ToolPanesProps) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

interface ToolFieldProps {
  label: string;
  /** A copy button, a counter, anything that belongs beside the label. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ToolField({
  label,
  action,
  children,
  className,
}: ToolFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex min-h-9 items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

interface ToolTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  className?: string;
}

export function ToolTextarea({
  value,
  onChange,
  placeholder,
  rows = 10,
  id,
  className,
}: ToolTextareaProps) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      rows={rows}
      className={cn(
        "scroll-slim w-full resize-y rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    />
  );
}

interface ToolOutputProps {
  value: string;
  error?: string | null;
  placeholder?: string;
  className?: string;
}

export function ToolOutput({
  value,
  error,
  placeholder = "The result appears here.",
  className,
}: ToolOutputProps) {
  return (
    <output
      aria-live="polite"
      className={cn(
        "scroll-slim block max-h-[32rem] min-h-56 w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed",
        className,
      )}
    >
      {error ? (
        <span className="text-destructive">{error}</span>
      ) : value === "" ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : (
        value
      )}
    </output>
  );
}

interface ToolOptionsProps {
  children: ReactNode;
}

/** A row of controls that wraps instead of overflowing on a phone. */
export function ToolOptions({ children }: ToolOptionsProps) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="flex flex-wrap gap-1 rounded-full bg-card p-1">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={option.value === value ? "default" : "ghost"}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(option.value !== value && "text-muted-foreground")}
        >
          {option.label}
        </Button>
      ))}
    </fieldset>
  );
}
