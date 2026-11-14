"use client";

import { GripVertical } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { moveItem } from "~/utils/reorder";

interface SortableGridProps<T> {
  items: readonly T[];
  keyOf: (item: T) => string;
  onReorder: (items: T[]) => void;
  children: (item: T, index: number) => ReactNode;
  /** Read out as the name of the list, such as "Pages". */
  label: string;
  className?: string;
}

/**
 * A grid whose cards can be dragged into another order, or moved with the
 * arrow keys from the handle, so the keyboard is never left behind.
 */
export function SortableGrid<T>({
  items,
  keyOf,
  onReorder,
  children,
  label,
  className,
}: SortableGridProps<T>) {
  const dragging = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) {
      return;
    }
    onReorder(moveItem(items, from, to));
  };

  return (
    <ul
      aria-label={label}
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={keyOf(item)}
          draggable
          onDragStart={(event) => {
            dragging.current = index;
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragEnter={() => setOver(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragging.current !== null) {
              move(dragging.current, index);
            }
            dragging.current = null;
            setOver(null);
          }}
          onDragEnd={() => {
            dragging.current = null;
            setOver(null);
          }}
          className={cn(
            "group relative flex cursor-grab flex-col gap-2 rounded-2xl bg-card p-2 transition-shadow active:cursor-grabbing",
            over === index && "ring-2 ring-primary",
          )}
        >
          {children(item, index)}
          <button
            type="button"
            aria-label={`Move ${label.toLowerCase()} ${index + 1}, use the arrow keys`}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(index, index - 1);
              }
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(index, index + 1);
              }
            }}
            className="absolute top-2 left-2 rounded-lg bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GripVertical className="size-4" strokeWidth={1.8} />
          </button>
        </li>
      ))}
    </ul>
  );
}
