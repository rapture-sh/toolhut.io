import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { JwtDecoderTool } from "~/components/tools/jwt-decoder-tool";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaXNzIjoidG9vbGh1dCIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("<JwtDecoderTool />", () => {
  it("should show the header, the claims and the expiry of a pasted token", async () => {
    const user = userEvent.setup();
    render(<JwtDecoderTool />);

    await user.click(
      screen.getByPlaceholderText("Paste a JSON web token here"),
    );
    await user.paste(TOKEN);

    // The JSON is drawn as coloured pieces, so it is read back as a whole.
    expect(screen.getByLabelText("Header").textContent).toContain(
      '"alg": "HS256"',
    );
    expect(screen.getByLabelText("Payload").textContent).toContain(
      '"name": "Jane Doe"',
    );
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.getByText("Issuer")).toBeInTheDocument();
    expect(
      screen.getByText("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"),
    ).toBeInTheDocument();
  });
});
