import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ColorShadesTool } from "~/components/tools/color-shades-tool";

describe("<ColorShadesTool />", () => {
  it("ramps the colour the user enters and writes it as CSS", async () => {
    const user = userEvent.setup();
    render(<ColorShadesTool />);
    const field = screen.getByLabelText("Colour");

    await user.clear(field);
    await user.type(field, "#3b82f6");

    expect(
      screen.getAllByRole("button", { name: /^Copy \d+, #/ }),
    ).toHaveLength(11);

    const prefix = screen.getByLabelText("Custom property prefix");

    await user.clear(prefix);
    await user.type(prefix, "brand");

    expect(screen.getByText(/--brand-50:/)).toBeInTheDocument();
    expect(screen.getByText(/--brand-950:/)).toBeInTheDocument();
  });
});
