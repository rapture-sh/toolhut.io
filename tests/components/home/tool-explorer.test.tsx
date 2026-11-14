import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolExplorer } from "~/components/home/tool-explorer";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

const suggestions = () =>
  screen.getByRole("listbox", { name: "Tool suggestions" });

const names = () =>
  within(suggestions())
    .getAllByRole("option")
    .map((option) => option.textContent);

/** The field only takes the cursor where there is a real pointer. */
function withFinePointer() {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    ...original(query),
    matches: true,
  })) as typeof window.matchMedia;

  return {
    restore: () => {
      window.matchMedia = original;
    },
  };
}

describe("<ToolExplorer />", () => {
  beforeEach(() => {
    push.mockClear();
    window.history.replaceState(null, "", "/");
  });

  it("should suggest nothing until something is typed", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    await user.click(screen.getByRole("combobox", { name: "Search tools" }));

    expect(
      screen.queryByRole("listbox", { name: "Tool suggestions" }),
    ).not.toBeInTheDocument();

    await user.keyboard("base64");

    expect(names()[0]).toContain("Base64");
  });

  it("should close the suggestions again when the field is emptied", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    const field = screen.getByRole("combobox", { name: "Search tools" });
    await user.type(field, "base64");

    expect(suggestions()).toBeInTheDocument();

    await user.clear(field);

    expect(
      screen.queryByRole("listbox", { name: "Tool suggestions" }),
    ).not.toBeInTheDocument();
  });

  it("should put the tool named after the words above one that merely mentions them", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    await user.type(
      screen.getByRole("combobox", { name: "Search tools" }),
      "image",
    );

    expect(names()[0]).toContain("Image");
  });

  it("should open the highlighted tool when you arrow down and press Enter", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    const field = screen.getByRole("combobox", { name: "Search tools" });
    await user.type(field, "base64");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(push).toHaveBeenCalledWith("/tools/base64");
  });

  it("should search for the words themselves when nothing is highlighted", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    await user.type(
      screen.getByRole("combobox", { name: "Search tools" }),
      "qr{Enter}",
    );

    expect(window.location.search).toBe("?q=qr");
    expect(push).not.toHaveBeenCalled();
  });

  it("should leave the grid alone until the search is committed", async () => {
    const user = userEvent.setup();
    render(<ToolExplorer />);

    await user.type(
      screen.getByRole("combobox", { name: "Search tools" }),
      "qr",
    );

    expect(
      screen.getByRole("link", { name: /Case converter/ }),
    ).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(
      screen.queryByRole("link", { name: /Case converter/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /QR code/ })).toBeInTheDocument();
  });

  it("should clear the filter when the field is emptied and committed", async () => {
    window.history.replaceState(null, "", "/?q=qr");
    const user = userEvent.setup();
    render(<ToolExplorer />);

    await user.clear(screen.getByRole("combobox", { name: "Search tools" }));
    await user.keyboard("{Enter}");

    expect(window.location.search).toBe("");
    expect(
      screen.getByRole("link", { name: /Case converter/ }),
    ).toBeInTheDocument();
  });

  it("should take the cursor on a plain visit, so you can type straight away", () => {
    const pointer = withFinePointer();
    render(<ToolExplorer />);

    expect(
      screen.getByRole("combobox", { name: "Search tools" }),
    ).toHaveFocus();
    expect(
      screen.queryByRole("listbox", { name: "Tool suggestions" }),
    ).not.toBeInTheDocument();
    pointer.restore();
  });

  it("should stay out of the way when the address already carries a search", () => {
    window.history.replaceState(null, "", "/?q=base64");
    const pointer = withFinePointer();
    render(<ToolExplorer />);

    expect(
      screen.getByRole("combobox", { name: "Search tools" }),
    ).not.toHaveFocus();
    expect(
      screen.queryByRole("listbox", { name: "Tool suggestions" }),
    ).not.toBeInTheDocument();
    pointer.restore();
  });

  it("should start from the words already in the address", async () => {
    window.history.replaceState(null, "", "/?q=base64");
    render(<ToolExplorer />);

    expect(screen.getByRole("combobox", { name: "Search tools" })).toHaveValue(
      "base64",
    );
  });
});
