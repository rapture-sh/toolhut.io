import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarkdownPreviewTool } from "~/components/tools/markdown-preview-tool";

describe("<MarkdownPreviewTool />", () => {
  it("should render the Markdown as a page", async () => {
    const user = userEvent.setup();
    render(<MarkdownPreviewTool />);

    await user.click(screen.getByPlaceholderText("# Write Markdown here"));
    await user.paste("# Title\n\n- one\n- two");

    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("should leave a script out of the HTML it hands back", async () => {
    const user = userEvent.setup();
    render(<MarkdownPreviewTool />);

    await user.click(screen.getByPlaceholderText("# Write Markdown here"));
    await user.paste("Hello\n\n<script>alert(1)</script>");
    await user.click(screen.getByRole("button", { name: "HTML" }));

    const output = screen.getByRole("status");

    expect(output).toHaveTextContent("<p>Hello</p>");
    expect(output.textContent).not.toContain("script");
  });
});
