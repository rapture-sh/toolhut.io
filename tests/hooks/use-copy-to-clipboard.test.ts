import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";

const writeText = vi.fn<(value: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

describe("useCopyToClipboard", () => {
  it("should write the value and report that it copied", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.copy("toolhut");
    });

    expect(writeText).toHaveBeenCalledWith("toolhut");
    expect(result.current.copied).toBe(true);
  });

  it("should do nothing for an empty value", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("");
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });

  it("should report failure when the clipboard is unavailable", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyToClipboard());

    let copied = true;
    await act(async () => {
      copied = await result.current.copy("toolhut");
    });

    expect(copied).toBe(false);
    expect(result.current.copied).toBe(false);
  });
});
