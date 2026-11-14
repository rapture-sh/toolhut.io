import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserAgentParserTool } from "~/components/tools/user-agent-parser-tool";

const CHROME_ON_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

describe("<UserAgentParserTool />", () => {
  it("should break a pasted string into rows", async () => {
    const user = userEvent.setup();
    render(<UserAgentParserTool />);

    await user.click(
      screen.getByPlaceholderText("Paste a user agent string here"),
    );
    await user.paste(CHROME_ON_WINDOWS);

    expect(screen.getByText("Chrome")).toBeInTheDocument();
    expect(screen.getByText("Blink")).toBeInTheDocument();
    expect(screen.getByText("Windows")).toBeInTheDocument();
  });
});
