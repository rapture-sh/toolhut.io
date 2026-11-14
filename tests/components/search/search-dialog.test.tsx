import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchDialog } from "~/components/search/search-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const suggestions = () =>
  screen.getByRole("listbox", { name: "Tool suggestions" });

describe("<SearchDialog />", () => {
  it("should offer the popular tools before anything is typed", () => {
    render(<SearchDialog open onOpenChange={() => undefined} />);

    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(within(suggestions()).getAllByRole("option")).toHaveLength(3);
  });

  it("should offer what matches once something is typed", async () => {
    const user = userEvent.setup();
    render(<SearchDialog open onOpenChange={() => undefined} />);

    await user.type(
      screen.getByRole("combobox", { name: "Search tools" }),
      "base64",
    );

    const options = within(suggestions()).getAllByRole("option");

    expect(options[0]?.textContent).toContain("Base64");
  });
});
