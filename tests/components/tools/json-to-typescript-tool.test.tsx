import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { JsonToTypescriptTool } from "~/components/tools/json-to-typescript-tool";

describe("<JsonToTypescriptTool />", () => {
  it("should write an interface for the sample and name it from the root name", async () => {
    const user = userEvent.setup();
    render(<JsonToTypescriptTool />);

    await user.click(screen.getByPlaceholderText("Paste a JSON sample here"));
    await user.paste('{"users":[{"id":1}]}');
    await user.clear(screen.getByLabelText("Root name"));
    await user.type(screen.getByLabelText("Root name"), "Payload");

    // The output is drawn as coloured pieces, so it is read back as a whole.
    const output = screen.getByLabelText("TypeScript").textContent;

    expect(output).toContain("export interface Payload");
    expect(output).toContain("export interface User");
  });

  it("should explain a sample that is not JSON", async () => {
    const user = userEvent.setup();
    render(<JsonToTypescriptTool />);

    await user.click(screen.getByPlaceholderText("Paste a JSON sample here"));
    await user.paste("{oops}");

    expect(screen.getByText(/not valid JSON/)).toBeInTheDocument();
  });
});
