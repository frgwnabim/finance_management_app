// Connection settings, resolved from whichever variables are present:
// our own names (DATABASE_URL / DIRECT_URL) or the ones Vercel's Neon
// integration sets (DATABASE_URL / DATABASE_URL_UNPOOLED, or the older
// POSTGRES_URL / POSTGRES_URL_NON_POOLING). Keeps deploys zero-config.
// Imported by prisma.config.ts, so keep this file free of "@/" imports.

import { createHash } from "node:crypto";

const env = (name: string) => process.env[name] || undefined;

/** Pooled connection string for the app at runtime. */
export function getDatabaseUrl() {
  return env("DATABASE_URL") ?? env("POSTGRES_URL");
}

/** Direct (non-pooled) connection string for migrations and seeding. */
export function getDirectDatabaseUrl() {
  return (
    env("DIRECT_URL") ??
    env("DATABASE_URL_UNPOOLED") ??
    env("POSTGRES_URL_NON_POOLING") ??
    getDatabaseUrl()
  );
}

export function isDatabaseConfigured() {
  return getDatabaseUrl() !== undefined;
}

/**
 * Secret for signing sessions: AUTH_SECRET when set, otherwise derived from
 * the database URL (itself a secret), so no manual setup is needed. Setting
 * AUTH_SECRET is still recommended; it lets you rotate the secret on its own.
 */
export function getAuthSecret() {
  const secret = env("AUTH_SECRET");
  if (secret) return secret;
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return undefined;
  return createHash("sha256").update(`finance-manager:auth-secret:${databaseUrl}`).digest("base64url");
}
