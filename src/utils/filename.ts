const EXTENSION = /\.[^./\\]{1,12}$/;

export function stripExtension(name: string): string {
  return name.replace(EXTENSION, "");
}

interface DownloadNameOptions {
  /** Appended to the stem, so `logo.png` becomes `logo-padded.png`. */
  suffix?: string;
  extension: string;
}

/** The name a downloaded file carries: the original stem, plus what it now is. */
export function downloadName(
  original: string,
  { suffix, extension }: DownloadNameOptions,
): string {
  const stem = stripExtension(original.trim()).trim() || "download";
  const tail = suffix ? `-${suffix}` : "";

  return `${stem}${tail}.${extension}`;
}
