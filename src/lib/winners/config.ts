/**
 * =============================================================================
 * DIGITAL HEROES — Phase 6: Winner Proof File Upload & Security Configuration
 * PRD Reference: § 09 (Winner Verification System)
 * =============================================================================
 *
 * GOVERNING RULES:
 * 1. Non-restrictive file format: The PRD mandates "screenshot of scores from
 *    the golf platform" without restricting file formats. We permit all common
 *    mobile and desktop image formats (PNG, JPEG, WebP, GIF, HEIC/HEIF, BMP, TIFF)
 *    and PDF documents.
 * 2. File size ceiling: Generous 20 MB ceiling to accommodate high-resolution
 *    modern smartphone screenshots and multi-page PDF handicap cards.
 * 3. Upload & Winner Ownership: Enforced server-side. Users may only upload
 *    evidence for winning records belonging strictly to their authenticated account.
 */

export const WINNER_PROOF_CONFIG = {
  /** Maximum allowable file size in bytes: 20 MB */
  MAX_FILE_SIZE_BYTES: 20 * 1024 * 1024,

  /** Human-readable max size string */
  MAX_FILE_SIZE_MB: 20,

  /** Allowed MIME prefixes / types */
  ALLOWED_MIME_TYPES: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/bmp",
    "image/tiff",
    "application/pdf",
  ] as const,

  /** Allowed file extensions */
  ALLOWED_EXTENSIONS: [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".heic",
    ".heif",
    ".bmp",
    ".tiff",
    ".pdf",
  ] as const,
} as const;

export interface FileMetadataInput {
  size: number;
  type?: string;
  name: string;
}

/**
 * Pure validator for submitted proof files.
 * Rejects empty files, files exceeding 20MB, or non-image/non-pdf formats.
 */
export function validateProofFile(file: FileMetadataInput): {
  isValid: boolean;
  error?: string;
} {
  if (!file || typeof file.size !== "number") {
    return { isValid: false, error: "No proof file provided." };
  }

  if (file.size <= 0) {
    return { isValid: false, error: "Uploaded file is empty (0 bytes)." };
  }

  if (file.size > WINNER_PROOF_CONFIG.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the ${WINNER_PROOF_CONFIG.MAX_FILE_SIZE_MB}MB limit. Please upload a smaller screenshot or compressed PDF.`,
    };
  }

  const fileName = (file.name || "").toLowerCase();
  const fileExt = "." + fileName.split(".").pop();
  const fileMime = (file.type || "").toLowerCase();

  const isAllowedExt = WINNER_PROOF_CONFIG.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  const isAllowedMime =
    fileMime.startsWith("image/") ||
    fileMime === "application/pdf" ||
    (WINNER_PROOF_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(fileMime);

  // Non-restrictive: accept if either valid MIME or valid extension is present
  if (!isAllowedMime && !isAllowedExt) {
    return {
      isValid: false,
      error:
        "Unsupported file format. Please upload a scorecard screenshot (PNG, JPG, WebP, HEIC) or PDF document.",
    };
  }

  return { isValid: true };
}
