export const SEARCH_FIELD_ID = "tool-search";

/** Asks the home page search field to take the cursor and show its list. */
export const SEARCH_FOCUS_EVENT = "toolhut:search-focus";

/**
 * Puts the cursor in the home page search field and brings it into view.
 * The event is what opens the suggestions, since a programmatic focus does
 * not always reach the field as a focus event.
 */
export function focusSearchField(): void {
  const field = document.getElementById(SEARCH_FIELD_ID);

  if (!(field instanceof HTMLInputElement)) {
    return;
  }

  field.scrollIntoView({ block: "center", behavior: "smooth" });
  field.focus({ preventScroll: true });
  field.select();
  window.dispatchEvent(new CustomEvent(SEARCH_FOCUS_EVENT));
}

/**
 * A touch keyboard covers half the page, so the field only takes the cursor
 * on its own where there is a real pointer.
 */
export function shouldFocusOnLoad(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  );
}
