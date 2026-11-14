import { degrees, PDFDocument } from "@cantoo/pdf-lib";

/** Thrown when a PDF cannot be built from what was given. */
export class PdfWriteError extends Error {
  constructor(message = "That PDF could not be written.") {
    super(message);
    this.name = "PdfWriteError";
  }
}

export async function loadPdf(file: Blob): Promise<PDFDocument> {
  try {
    // Loading a file must not change it. Without this, pdf-lib stamps its own
    // Producer and a fresh modified date on every document it opens, which a
    // tool that shows you those details would then report as yours.
    return await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch (error) {
    if (error instanceof Error && /encrypt/i.test(error.message)) {
      throw new PdfWriteError("That PDF is password protected.");
    }
    throw new PdfWriteError("That file is not a PDF this browser can read.");
  }
}

export async function emptyPdf(): Promise<PDFDocument> {
  return await PDFDocument.create();
}

export async function savePdf(document: PDFDocument): Promise<Blob> {
  const bytes = await document.save();

  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export interface PagePick {
  /** Which loaded document the page comes from. */
  source: number;
  /** The page itself, counting from 1. */
  page: number;
  /** A quarter turn clockwise each, so 0 to 3. */
  turns?: number;
}

/**
 * Builds one document out of pages taken from others, in the order given.
 * This is what merging, splitting and reordering all come down to.
 */
export async function collectPages(
  sources: readonly PDFDocument[],
  picks: readonly PagePick[],
): Promise<PDFDocument> {
  if (picks.length === 0) {
    throw new PdfWriteError("Choose at least one page.");
  }

  const built = await PDFDocument.create();

  for (const pick of picks) {
    const source = sources[pick.source];

    if (!source) {
      throw new PdfWriteError("That page came from a file that is not open.");
    }

    const index = pick.page - 1;

    if (index < 0 || index >= source.getPageCount()) {
      throw new PdfWriteError(`There is no page ${pick.page} in that file.`);
    }

    const [copied] = await built.copyPages(source, [index]);

    if (!copied) {
      throw new PdfWriteError("That page could not be copied.");
    }

    if (pick.turns) {
      const current = copied.getRotation().angle;
      copied.setRotation(degrees((current + pick.turns * 90) % 360));
    }

    built.addPage(copied);
  }

  return built;
}

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  created: Date | undefined;
  modified: Date | undefined;
}

export function readMetadata(document: PDFDocument): PdfMetadata {
  return {
    title: document.getTitle() ?? "",
    author: document.getAuthor() ?? "",
    subject: document.getSubject() ?? "",
    keywords: (document.getKeywords() ?? "").toString(),
    creator: document.getCreator() ?? "",
    producer: document.getProducer() ?? "",
    created: document.getCreationDate(),
    modified: document.getModificationDate(),
  };
}

/**
 * Empties every field a PDF carries about who made it and when. The dates
 * cannot be removed outright, only set, so they are pinned to the start of
 * 1970 rather than left pointing at today.
 */
export function stripMetadata(document: PDFDocument): void {
  document.setTitle("");
  document.setAuthor("");
  document.setSubject("");
  document.setKeywords([]);
  document.setCreator("");
  document.setProducer("");
  document.setCreationDate(new Date(0));
  document.setModificationDate(new Date(0));
}
