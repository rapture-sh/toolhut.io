import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CronParserTool } from "~/components/tools/cron-parser-tool";

describe("<CronParserTool />", () => {
  it("should explain the expression the user types", async () => {
    const user = userEvent.setup();
    render(<CronParserTool />);

    const field = screen.getByLabelText("Cron expression");
    await user.clear(field);
    await user.type(field, "*/15 * * * *");

    expect(screen.getByText("Every 15 minutes")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });
});
