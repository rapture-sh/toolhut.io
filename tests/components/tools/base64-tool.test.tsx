import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Base64Tool } from "~/components/tools/base64-tool";

describe("<Base64Tool />", () => {
  it("encodes what the user types", async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);

    await user.type(screen.getByPlaceholderText("Paste text here"), "toolhut");

    expect(screen.getByText("dG9vbGh1dA==")).toBeInTheDocument();
  });

  it("explains invalid input when decoding", async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);

    await user.click(screen.getByRole("button", { name: "decode" }));
    await user.type(
      screen.getByPlaceholderText("Paste Base64 here"),
      "not base64!!",
    );

    expect(
      screen.getByText("That is not valid Base64 text."),
    ).toBeInTheDocument();
  });
});
