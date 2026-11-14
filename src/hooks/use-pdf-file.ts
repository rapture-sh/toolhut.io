"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";
import { closePdf, openPdf, PdfReadError } from "~/lib/pdf/document";

interface LoadedPdf {
  pdf: PDFDocumentProxy | null;
  pages: number;
  error: string | null;
  loading: boolean;
}

const EMPTY: LoadedPdf = { pdf: null, pages: 0, error: null, loading: false };

/**
 * Opens a PDF once and keeps it open while the tool works on it, because
 * closing a document takes its worker with it. Closed on the way out.
 */
export function usePdfFile(file: File | null): LoadedPdf {
  const [state, setState] = useState<LoadedPdf>(EMPTY);

  useEffect(() => {
    if (!file) {
      setState(EMPTY);
      return;
    }

    let cancelled = false;
    let opened: PDFDocumentProxy | null = null;

    setState({ pdf: null, pages: 0, error: null, loading: true });

    openPdf(file)
      .then((pdf) => {
        if (cancelled) {
          void closePdf(pdf);
          return;
        }
        opened = pdf;
        setState({ pdf, pages: pdf.numPages, error: null, loading: false });
      })
      .catch((thrown: unknown) => {
        if (cancelled) {
          return;
        }
        setState({
          pdf: null,
          pages: 0,
          error:
            thrown instanceof PdfReadError
              ? thrown.message
              : "That PDF could not be opened.",
          loading: false,
        });
      });

    return () => {
      cancelled = true;
      if (opened) {
        void closePdf(opened);
      }
    };
  }, [file]);

  return state;
}
