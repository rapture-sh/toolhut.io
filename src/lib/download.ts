/**
 * Hands a file to the browser's own download. Nothing is uploaded: the blob
 * only ever exists in this tab.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  // Firefox cancels the download if the URL goes away in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(
  text: string,
  filename: string,
  type = "text/plain;charset=utf-8",
): void {
  downloadBlob(new Blob([text], { type }), filename);
}
