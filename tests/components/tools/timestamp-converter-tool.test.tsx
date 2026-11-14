import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TimestampConverterTool } from "~/components/tools/timestamp-converter-tool";

describe("<TimestampConverterTool />", () => {
  it("turns a timestamp in seconds into a date", async () => {
    const user = userEvent.setup();
    render(<TimestampConverterTool />);

    await user.type(screen.getByLabelText("Unix timestamp"), "1700000000");

    expect(screen.getByText("2023-11-14T22:13:20.000Z")).toBeInTheDocument();
    expect(
      screen.getByText("Tue, 14 Nov 2023 22:13:20 GMT"),
    ).toBeInTheDocument();
  });
});
