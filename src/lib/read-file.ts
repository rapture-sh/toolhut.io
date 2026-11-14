import { isTextFileName, isTextFileType } from "~/utils/text-file";

/** Past this a paste or a drop is almost certainly a mistake. */
export const MAX_TEXT_BYTES = 8 * 1024 * 1024;

export function isTextFile(file: File): boolean {
  return (
    file.size <= MAX_TEXT_BYTES &&
    (isTextFileType(file.type) || isTextFileName(file.name))
  );
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|avif|bmp|ico|svg)$/i;

/** Some systems hand over a dropped file with no type at all, so the name counts too. */
export function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    (file.type === "" && IMAGE_EXTENSIONS.test(file.name))
  );
}

export async function readTextFile(file: File): Promise<string> {
  return await file.text();
}

export function firstMatching(
  files: readonly File[],
  matches: (file: File) => boolean,
): File | undefined {
  return files.find(matches);
}
