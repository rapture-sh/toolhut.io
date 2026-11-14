import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ColorConverterTool } from "~/components/tools/color-converter-tool";

describe("<ColorConverterTool />", () => {
  it("should convert what the user types and keep the last good colour", async () => {
    const user = userEvent.setup();
    render(<ColorConverterTool />);
    const field = screen.getByLabelText("Colour");

    await user.clear(field);
    await user.type(field, "rebeccapurple");

    expect(screen.getByText("rgb(102, 51, 153)")).toBeInTheDocument();

    await user.type(field, "!");

    expect(
      screen.getByText("That is not a colour this tool understands."),
    ).toBeInTheDocument();
    expect(screen.getByText("rgb(102, 51, 153)")).toBeInTheDocument();
  });
});
