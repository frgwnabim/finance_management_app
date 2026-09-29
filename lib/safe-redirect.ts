export const DEFAULT_REDIRECT = "/app";

/**
 * Turns a user-supplied callbackUrl into a same-site path under /app.
 * Auth.js passes an absolute URL, so only the path is kept; anything
 * outside /app falls back to the default. Prevents open redirects.
 */
export function getSafeRedirect(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return DEFAULT_REDIRECT;
  }

  try {
    const url = new URL(value, "http://localhost");
    const isAppPath =
      url.pathname === "/app" || url.pathname.startsWith("/app/");
    return isAppPath ? `${url.pathname}${url.search}` : DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
}
