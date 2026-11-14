import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist";

/** Thrown when a file is not a PDF this browser can open. */
export class PdfReadError extends Error {
  constructor(message = "That file is not a PDF this browser can read.") {
    super(message);
    this.name = "PdfReadError";
  }
}

let wired = false;

/**
 * pdf.js does its work in a worker. The worker is bundled from the installed
 * package and served from this origin, so opening a PDF reaches no CDN.
 */
function wireWorker(): void {
  if (wired) {
    return;
  }

  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  wired = true;
}

export async function openPdf(file: Blob): Promise<PDFDocumentProxy> {
  wireWorker();

  try {
    const data = new Uint8Array(await file.arrayBuffer());

    return await getDocument({ data }).promise;
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") {
      throw new PdfReadError("That PDF is password protected.");
    }
    throw new PdfReadError();
  }
}

/** Lets go of the worker and the memory the document was holding. */
export async function closePdf(pdf: PDFDocumentProxy): Promise<void> {
  await pdf.loadingTask.destroy();
}

interface RenderOptions {
  /** The longest side of the result, in pixels. */
  maxSide?: number;
  /** Drawn behind the page, since a PDF page has no background of its own. */
  background?: string;
}

export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  { maxSide = 1200, background = "#ffffff" }: RenderOptions = {},
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = maxSide / Math.max(base.width, base.height);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new PdfReadError("This browser cannot draw on a canvas.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // The print intent paces the drawing with timers rather than animation
  // frames. A page nobody is looking at gets no animation frames, so with the
  // display intent a render started in a background tab never finishes.
  await page.render({ canvas, viewport, intent: "print" }).promise;
  page.cleanup();

  return canvas;
}

/** The words on a page, with the line breaks the document implies. */
export async function pageText(
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();

  const lines: string[] = [];
  let line = "";

  for (const item of content.items) {
    if (!("str" in item)) {
      continue;
    }

    line += item.str;

    if (item.hasEOL) {
      lines.push(line);
      line = "";
    }
  }

  if (line !== "") {
    lines.push(line);
  }

  page.cleanup();

  return lines.join("\n");
}

export interface PageSize {
  width: number;
  height: number;
}

export async function pageSize(
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<PageSize> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  page.cleanup();

  return {
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
  };
}
