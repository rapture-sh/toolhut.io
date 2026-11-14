import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolTextarea } from "~/components/tools/tool-io";

describe("<ToolTextarea />", () => {
  it("should fill itself with the text of a dropped file", async () => {
    const onChange = vi.fn();
    render(
      <ToolTextarea
        value=""
        onChange={onChange}
        placeholder="Paste text here"
      />,
    );
    const field = screen.getByPlaceholderText("Paste text here");
    const file = new File(["dropped text"], "notes.txt", {
      type: "text/plain",
    });
    const dataTransfer = {
      types: ["Files"],
      files: [file],
      dropEffect: "none",
    };

    if (field.parentElement) {
      fireEvent.drop(field.parentElement, { dataTransfer });
    }

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("dropped text"));
  });

  it("should ignore a dropped image, which has no text worth showing", async () => {
    const onChange = vi.fn();
    render(
      <ToolTextarea
        value=""
        onChange={onChange}
        placeholder="Paste text here"
      />,
    );
    const field = screen.getByPlaceholderText("Paste text here");
    const file = new File(["binary"], "holiday.png", { type: "image/png" });
    const dataTransfer = {
      types: ["Files"],
      files: [file],
      dropEffect: "none",
    };

    if (field.parentElement) {
      fireEvent.drop(field.parentElement, { dataTransfer });
    }

    await waitFor(() => expect(onChange).not.toHaveBeenCalled());
  });
});
