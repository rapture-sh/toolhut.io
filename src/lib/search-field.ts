export const SEARCH_FIELD_ID = "tool-search";

/**
 * Puts the cursor in the home page search field and brings it into view.
 * Used by the header when you are already on the home page.
 */
export function focusSearchField(): void {
  const field = document.getElementById(SEARCH_FIELD_ID);

  if (!(field instanceof HTMLInputElement)) {
    return;
  }

  field.scrollIntoView({ block: "center", behavior: "smooth" });
  field.focus({ preventScroll: true });
  field.select();
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
