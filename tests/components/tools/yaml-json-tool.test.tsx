import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { YamlJsonTool } from "~/components/tools/yaml-json-tool";

describe("<YamlJsonTool />", () => {
  it("converts typed YAML into JSON", async () => {
    const user = userEvent.setup();
    render(<YamlJsonTool />);

    await user.type(screen.getByPlaceholderText(/name: toolhut/), "name: abi");

    expect(screen.getByRole("status")).toHaveTextContent('"name": "abi"');
  });
});
