import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TomlJsonTool } from "~/components/tools/toml-json-tool";

describe("<TomlJsonTool />", () => {
  it("should convert typed TOML into JSON", async () => {
    const user = userEvent.setup();
    render(<TomlJsonTool />);

    await user.type(screen.getByPlaceholderText(/title = /), "count = 3");

    expect(screen.getByRole("status")).toHaveTextContent('"count": 3');
  });
});
