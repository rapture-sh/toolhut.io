import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropZone } from "~/components/tools/drop-zone";

const fileDrag = (files: File[]) => ({
  dataTransfer: { types: ["Files"], files, dropEffect: "none" },
});

describe("<DropZone />", () => {
  it("says where the file goes while it is held over the field", () => {
    render(
      <DropZone onFiles={() => undefined} label="Drop a text file here">
        <textarea aria-label="Text" />
      </DropZone>,
    );
    const zone = screen.getByLabelText("Text").parentElement;

    expect(screen.queryByText("Drop a text file here")).not.toBeInTheDocument();

    if (zone) {
      fireEvent.dragEnter(zone, fileDrag([]));
    }

    expect(screen.getByText("Drop a text file here")).toBeInTheDocument();
  });

  it("hands over the dropped files and takes the overlay away", () => {
    const onFiles = vi.fn();
    render(
      <DropZone onFiles={onFiles} label="Drop a text file here">
        <textarea aria-label="Text" />
      </DropZone>,
    );
    const zone = screen.getByLabelText("Text").parentElement;
    const file = new File(["toolhut"], "notes.txt", { type: "text/plain" });

    if (zone) {
      fireEvent.dragEnter(zone, fileDrag([file]));
      fireEvent.drop(zone, fileDrag([file]));
    }

    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.queryByText("Drop a text file here")).not.toBeInTheDocument();
  });

  it("ignores a drag that carries no file, such as selected text", () => {
    render(
      <DropZone onFiles={() => undefined} label="Drop a text file here">
        <textarea aria-label="Text" />
      </DropZone>,
    );
    const zone = screen.getByLabelText("Text").parentElement;

    if (zone) {
      fireEvent.dragEnter(zone, {
        dataTransfer: { types: ["text/plain"], files: [] },
      });
    }

    expect(screen.queryByText("Drop a text file here")).not.toBeInTheDocument();
  });
});
