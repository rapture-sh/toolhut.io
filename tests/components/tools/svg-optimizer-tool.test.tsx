import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SvgOptimizerTool } from "~/components/tools/svg-optimizer-tool";

const MESSY = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- made in an editor --><metadata>leftovers</metadata><path d="M1.00000 2.00000 L3.00000 4.00000"/></svg>`;

describe("<SvgOptimizerTool />", () => {
  it("strips the editor leftovers and says what it saved", async () => {
    const user = userEvent.setup();
    render(<SvgOptimizerTool />);

    await user.click(screen.getByPlaceholderText(/paste svg markup/i));
    await user.paste(MESSY);

    const output = screen.getByRole("status");
    await waitFor(() => expect(output.textContent).toContain("<path"));

    expect(output.textContent).not.toContain("<!--");
    expect(output.textContent).not.toContain("<metadata>");
    expect(await screen.findByText(/per cent smaller/)).toBeInTheDocument();
  });

  it("explains markup that is not an SVG", async () => {
    const user = userEvent.setup();
    render(<SvgOptimizerTool />);

    await user.click(screen.getByPlaceholderText(/paste svg markup/i));
    await user.paste("just some words");

    expect(
      await screen.findByText("That markup has no <svg> element in it."),
    ).toBeInTheDocument();
  });
});
