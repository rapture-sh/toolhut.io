"use client";

import { useEffect, useState } from "react";
import { ImageDecodeError, loadImage } from "~/lib/image/canvas";

interface LoadedImage {
  bitmap: ImageBitmap | null;
  url: string | null;
  error: string | null;
  loading: boolean;
}

/**
 * Decodes a picked image once and keeps the bitmap and a preview URL alive
 * until another file replaces it. Both are released on the way out.
 */
export function useImageFile(file: File | null): LoadedImage {
  const [state, setState] = useState<LoadedImage>({
    bitmap: null,
    url: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!file) {
      setState({ bitmap: null, url: null, error: null, loading: false });
      return;
    }

    let cancelled = false;
    const url = URL.createObjectURL(file);
    setState({ bitmap: null, url, error: null, loading: true });

    let decoded: ImageBitmap | null = null;

    loadImage(file)
      .then((bitmap) => {
        if (cancelled) {
          bitmap.close();
          return;
        }
        decoded = bitmap;
        setState({ bitmap, url, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setState({
          bitmap: null,
          url,
          error:
            error instanceof ImageDecodeError
              ? error.message
              : "That image could not be read.",
          loading: false,
        });
      });

    return () => {
      cancelled = true;
      decoded?.close();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return state;
}
