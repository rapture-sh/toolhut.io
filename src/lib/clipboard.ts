import { toPngBlob } from "~/lib/image/canvas";

/**
 * Puts an image on the clipboard. Browsers only accept PNG there, so anything
 * else is re-encoded first and the caller should say so in the UI.
 */
export async function copyImage(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }

  try {
    const png = blob.type === "image/png" ? blob : await toPngBlob(blob);

    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);

    return true;
  } catch {
    return false;
  }
}
