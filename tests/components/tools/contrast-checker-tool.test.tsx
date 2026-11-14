import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContrastCheckerTool } from "~/components/tools/contrast-checker-tool";

describe("<ContrastCheckerTool />", () => {
  it("should rate the pair the user enters, and swap them round", async () => {
    const user = userEvent.setup();
    render(<ContrastCheckerTool />);
    const field = screen.getByLabelText("Text colour");

    await user.clear(field);
    await user.type(field, "#000000");

    expect(screen.getByText("21:1")).toBeInTheDocument();
    expect(screen.getAllByText("Pass")).toHaveLength(4);

    await user.click(
      screen.getByRole("button", { name: /swap the two colours/i }),
    );

    expect(screen.getByLabelText("Text colour")).toHaveValue("#ffffff");
    expect(screen.getByLabelText("Background colour")).toHaveValue("#000000");
    expect(screen.getByText("21:1")).toBeInTheDocument();
  });
});
