"use client";

import { Check, Copy } from "lucide-react";
import { createContext, type ReactNode, useContext, useId } from "react";
import { DropZone } from "~/components/tools/drop-zone";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { isTextFile, readTextFile } from "~/lib/read-file";
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

interface Field {
  id: string;
  labelId: string;
}

/** Lets the field inside a `ToolField` answer to the label above it. */
const FieldContext = createContext<Field | null>(null);

/** The ids of the surrounding `ToolField`, for anything rendering its own output. */
export function useToolField(): Field | null {
  return useContext(FieldContext);
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
  const id = useId();
  const field = { id, labelId: `${id}-label` };

  return (
    <FieldContext.Provider value={field}>
      <div className={cn("flex min-w-0 flex-col gap-2", className)}>
        <div className="flex min-h-9 items-center justify-between gap-2">
          <label
            id={field.labelId}
            htmlFor={field.id}
            className="text-sm font-medium"
          >
            {label}
          </label>
          {action}
        </div>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

interface ToolTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  /** Take a file from Ctrl+V too. Only one field per page should ask. */
  pasteFiles?: boolean;
  className?: string;
}

/** A text field that also takes a dropped text file, which most tools want. */
export function ToolTextarea({
  value,
  onChange,
  placeholder,
  id,
  pasteFiles = false,
  className,
}: ToolTextareaProps) {
  const field = useContext(FieldContext);

  const takeFile = async (files: File[]) => {
    const text = files.find(isTextFile);
    if (text) {
      onChange(await readTextFile(text));
    }
  };

  return (
    <DropZone
      onFiles={takeFile}
      label="Drop a text file here"
      paste={pasteFiles}
      className="flex min-w-0"
    >
      <textarea
        id={id ?? field?.id}
        aria-labelledby={id ? undefined : field?.labelId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(
          "scroll-slim h-72 min-h-32 w-full resize-y rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
      />
    </DropZone>
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
  const field = useContext(FieldContext);

  return (
    <output
      id={field?.id}
      aria-labelledby={field?.labelId}
      aria-live="polite"
      className={cn(
        "scroll-slim block h-72 w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed",
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
  className?: string;
}

/** A row of controls that wraps instead of overflowing on a phone. */
export function ToolOptions({ children, className }: ToolOptionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
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
    <fieldset className="flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-card p-1">
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

interface ToolSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** What the number means, such as `80%` or `1024 px`. */
  display?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function ToolSlider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
  className,
}: ToolSliderProps) {
  const id = useId();

  return (
    <div className={cn("flex min-w-48 flex-1 flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {display ?? value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-primary"
      />
    </div>
  );
}

interface ToolNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** A unit drawn after the field, such as `px`. */
  suffix?: string;
  className?: string;
}

export function ToolNumber({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
  className,
}: ToolNumberProps) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 w-24 min-w-0 rounded-xl bg-muted px-3 font-mono text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        />
        {suffix && (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}
