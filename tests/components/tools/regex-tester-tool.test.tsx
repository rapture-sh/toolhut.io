import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RegexTesterTool } from "~/components/tools/regex-tester-tool";

describe("<RegexTesterTool />", () => {
  it("counts the matches of the pattern in the text", async () => {
    const user = userEvent.setup();
    render(<RegexTesterTool />);

    await user.click(screen.getByLabelText("Pattern"));
    await user.paste("[0-9]+");
    await user.click(
      screen.getByPlaceholderText("Paste the text to match against"),
    );
    await user.paste("a1 b22 c");

    expect(screen.getByText("2 matches")).toBeInTheDocument();
    expect(screen.getByText("at 4")).toBeInTheDocument();
  });

  it("explains a pattern the engine cannot compile", async () => {
    const user = userEvent.setup();
    render(<RegexTesterTool />);

    await user.click(screen.getByLabelText("Pattern"));
    await user.paste("(unclosed");

    expect(screen.getByText(/invalid regular expression/i)).toBeInTheDocument();
  });
});
