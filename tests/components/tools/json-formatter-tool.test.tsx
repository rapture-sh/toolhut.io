import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { JsonFormatterTool } from "~/components/tools/json-formatter-tool";

describe("<JsonFormatterTool />", () => {
  it("formats pasted JSON with sorted keys when asked", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool />);

    await user.click(screen.getByPlaceholderText("Paste JSON here"));
    await user.paste('{"b":1,"a":2}');
    await user.click(screen.getByRole("checkbox", { name: /sort keys/i }));

    // The output is drawn as coloured pieces, so it is read back as a whole.
    expect(screen.getByLabelText("Formatted").textContent).toMatch(
      /"a": 2,\s+"b": 1/,
    );
  });

  it("says which line and column the mistake is on", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool />);

    await user.click(screen.getByPlaceholderText("Paste JSON here"));
    await user.paste('{\n  "a": 1,\n}');

    expect(screen.getByText(/Line 3, column 1/)).toBeInTheDocument();
  });
});
