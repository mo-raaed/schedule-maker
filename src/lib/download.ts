/**
 * Save a generated file to the user's device.
 *
 * iOS/iPadOS Safari can't reliably download large `data:` URLs or blob URLs
 * that are revoked right after the click: it shows the "Download?" prompt,
 * then nothing happens. There we prefer the native share sheet (Save Image /
 * Save to Files), and fall back to a blob-URL link that stays alive long
 * enough for the download to actually start.
 */
export async function saveFile(blob: Blob, filename: string): Promise<void> {
  if (isAppleMobile()) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch (err) {
        // User closed the share sheet: nothing to do.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Otherwise (e.g. the tap's user activation expired while the file
        // was rendering) fall through to a regular download.
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately cancels the download on Safari.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function isAppleMobile(): boolean {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac; the touch points give it away.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
