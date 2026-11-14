import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CsvToJsonTool } from "~/components/tools/csv-to-json-tool";

describe("<CsvToJsonTool />", () => {
  it("turns a pasted CSV into JSON keyed by the header row", async () => {
    const user = userEvent.setup();
    render(<CsvToJsonTool />);

    await user.type(
      screen.getByPlaceholderText(/name,age/),
      "name,age{enter}alice,31",
    );

    expect(screen.getByRole("status")).toHaveTextContent('"name": "alice"');
    expect(screen.getByRole("status")).toHaveTextContent('"age": 31');
  });
});
