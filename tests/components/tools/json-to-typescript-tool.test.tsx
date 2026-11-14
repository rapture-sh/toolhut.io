import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { JsonToTypescriptTool } from "~/components/tools/json-to-typescript-tool";

describe("<JsonToTypescriptTool />", () => {
  it("writes an interface for the sample and names it from the root name", async () => {
    const user = userEvent.setup();
    render(<JsonToTypescriptTool />);

    await user.click(screen.getByPlaceholderText("Paste a JSON sample here"));
    await user.paste('{"users":[{"id":1}]}');
    await user.clear(screen.getByLabelText("Root name"));
    await user.type(screen.getByLabelText("Root name"), "Payload");

    expect(screen.getByText(/export interface Payload/)).toBeInTheDocument();
    expect(screen.getByText(/export interface User/)).toBeInTheDocument();
  });

  it("explains a sample that is not JSON", async () => {
    const user = userEvent.setup();
    render(<JsonToTypescriptTool />);

    await user.click(screen.getByPlaceholderText("Paste a JSON sample here"));
    await user.paste("{oops}");

    expect(screen.getByText(/not valid JSON/)).toBeInTheDocument();
  });
});
