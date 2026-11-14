/**
 * Moves one item to another place in a list, the way dragging a card does.
 * An index outside the list leaves the list alone, and the list handed in is
 * never changed.
 */
export function moveItem<T>(
  items: readonly T[],
  from: number,
  to: number,
): T[] {
  const next = [...items];

  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= next.length ||
    to >= next.length ||
    from === to
  ) {
    return next;
  }

  const [moved] = next.splice(from, 1);

  if (moved === undefined) {
    return [...items];
  }

  next.splice(to, 0, moved);

  return next;
}
