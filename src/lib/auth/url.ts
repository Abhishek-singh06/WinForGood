/**
 * Authentication & URL Configuration Utilities
 * Authoritative handler for canonical application URLs and open-redirect defenses.
 */

/**
 * Returns the canonical base URL for the application.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_APP_URL
 * 2. Fallback to "http://localhost:3000" for local development
 *
 * Strips trailing slashes to ensure consistent path concatenation.
 */
export function getAppUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (rawUrl && rawUrl.length > 0) {
    return rawUrl.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Validates and sanitizes a path parameter to prevent open redirect vulnerabilities.
 * Strictly guarantees that the destination is an internal relative application path.
 *
 * Disallowed:
 * - Protocol-relative URLs: "//evil.com"
 * - Malformed slash combinations: "/\evil.com" or paths containing "\"
 * - Absolute URLs with schemes: "https://evil.com", "javascript:alert(1)"
 * - Empty or whitespace-only paths
 *
 * @param path - Proposed redirect destination (e.g. from query string or next param)
 * @param defaultPath - Safe fallback route (defaults to "/dashboard")
 */
export function getSafeRedirectPath(
  path?: string | null,
  defaultPath: string = "/dashboard"
): string {
  if (!path || typeof path !== "string") {
    return defaultPath;
  }

  const trimmed = path.trim();

  // Must begin with a single "/"
  if (!trimmed.startsWith("/")) {
    return defaultPath;
  }

  // Prevent protocol-relative URLs (e.g., "//attacker.com")
  if (trimmed.startsWith("//")) {
    return defaultPath;
  }

  // Prevent backslash escaping and Windows path navigation
  if (trimmed.includes("\\")) {
    return defaultPath;
  }

  // Prevent control characters or whitespace within path
  if (/[\s\x00-\x1F\x7F]/.test(trimmed)) {
    return defaultPath;
  }

  // Prevent explicit scheme within relative representation
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultPath;
  }

  return trimmed;
}

/**
 * Constructs the canonical Auth Callback URL for Supabase authentication redirects.
 * Used for email verification (emailRedirectTo) and OAuth/PKCE flows.
 *
 * @param next - Optional safe relative route to redirect the user after session confirmation
 */
export function getAuthCallbackUrl(next?: string | null): string {
  const baseUrl = getAppUrl();
  const safeNext = next ? getSafeRedirectPath(next) : null;

  if (safeNext && safeNext !== "/dashboard") {
    return `${baseUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  }

  return `${baseUrl}/auth/callback`;
}
