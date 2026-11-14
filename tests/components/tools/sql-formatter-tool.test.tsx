import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SqlFormatterTool } from "~/components/tools/sql-formatter-tool";

describe("<SqlFormatterTool />", () => {
  it("formats a typed query and squashes it back to one line", async () => {
    const user = userEvent.setup();
    render(<SqlFormatterTool />);

    await user.type(
      screen.getByPlaceholderText(/select a, b from t/),
      "select a from t",
    );

    expect(screen.getByRole("status")).toHaveTextContent("SELECT a FROM t");

    await user.click(screen.getByRole("button", { name: "Minify" }));

    expect(screen.getByRole("status")).toHaveTextContent("select a from t");
  });
});
