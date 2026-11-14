import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { XmlJsonTool } from "~/components/tools/xml-json-tool";

describe("<XmlJsonTool />", () => {
  it("keeps an attribute when converting typed XML into JSON", async () => {
    const user = userEvent.setup();
    render(<XmlJsonTool />);

    await user.type(
      screen.getByPlaceholderText(/<title>Dune<\/title>/),
      '<book id="7">Dune</book>',
    );

    expect(screen.getByRole("status")).toHaveTextContent('"@id": "7"');
  });
});
