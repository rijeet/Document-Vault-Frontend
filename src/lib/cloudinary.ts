import type { DocumentFile } from "@/types/entities";

const CARD_THUMBNAIL_TRANSFORM = "w_500,h_375,c_fill,q_auto,f_auto";
const DETAIL_THUMBNAIL_TRANSFORM = "w_800,h_600,c_limit,q_auto,f_auto";

/**
 * Builds a Cloudinary-transformed thumbnail URL for a document file.
 * - Images: resized via Cloudinary's URL-based transformations.
 * - PDFs: Cloudinary rasterizes page 1 into an image (`pg_1`) since PDFs
 *   upload under resource_type "image" (see CloudinaryService's `auto`
 *   detection), then the same resize transformation applies on top.
 * - Anything else Cloudinary can't rasterize: returns null so the caller
 *   falls back to a generic icon.
 *
 * "card" = list view thumbnail (fixed crop, fills the card).
 * "detail" = larger preview on the document detail page (fits within
 * bounds without cropping, so tall/narrow scans aren't cut off).
 */
export function getThumbnailUrl(
  file: Pick<DocumentFile, "secureUrl" | "mimeType">,
  variant: "card" | "detail" = "card",
): string | null {
  if (!file.secureUrl.includes("/upload/")) return null;

  const transform = variant === "card" ? CARD_THUMBNAIL_TRANSFORM : DETAIL_THUMBNAIL_TRANSFORM;

  if (file.mimeType.startsWith("image/")) {
    return file.secureUrl.replace("/upload/", `/upload/${transform}/`);
  }

  if (file.mimeType === "application/pdf") {
    return file.secureUrl.replace("/upload/", `/upload/pg_1,${transform}/`);
  }

  return null;
}