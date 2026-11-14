import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordGeneratorTool } from "~/components/tools/password-generator-tool";

describe("<PasswordGeneratorTool />", () => {
  it("should show a password and narrow it to the sets left on", async () => {
    const user = userEvent.setup();
    render(<PasswordGeneratorTool />);

    const output = screen.getByRole("status");
    const first = output.textContent ?? "";

    expect(first).toHaveLength(20);

    await user.click(screen.getByRole("checkbox", { name: "Uppercase A-Z" }));
    await user.click(screen.getByRole("checkbox", { name: "Digits 0-9" }));
    await user.click(screen.getByRole("checkbox", { name: "Symbols" }));

    expect(output.textContent).toMatch(/^[a-z]{20}$/);

    await user.click(screen.getByRole("button", { name: /regenerate/i }));

    expect(screen.getByText(/bits of entropy/)).toBeInTheDocument();
  });
});
