import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { QrCodeTool } from "~/components/tools/qr-code-tool";

describe("<QrCodeTool />", () => {
  it("should encode a link the user types", async () => {
    const user = userEvent.setup();
    render(<QrCodeTool />);

    await user.type(screen.getByLabelText("Link"), "toolhut.io");

    expect(screen.getByText("https://toolhut.io/")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR code" })).toBeInTheDocument();
  });
});
