/**
 * Environment configuration, read once at startup.
 *
 * Uses an explicit browser check rather than `import "server-only"`, because
 * the Better Auth CLI evaluates this file (through lib/auth.ts) in plain Node,
 * where that package throws. See lib/auth.ts.
 */
if (typeof window !== "undefined") {
  throw new Error("lib/env.ts is server-only and must not be imported from client code.");
}


/**
 * Reads a required environment variable, failing fast at startup rather than
 * surfacing an opaque error deep inside the auth or database layer.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const DATABASE_URL = required("DATABASE_URL");

/** Base URL the app is served from. Also the OAuth issuer for the MCP plugin. */
export const BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

/**
 * Canonical MCP protected-resource identifier (RFC 8707 / RFC 9728). Issued
 * access tokens are audience-bound to this exact string, so the value here and
 * the one passed to `requireMcpAuth` must stay identical.
 */
export const MCP_RESOURCE = `${BETTER_AUTH_URL}/api/mcp`;

/** Relying Party ID for WebAuthn: the bare domain, without scheme or port. */
export const RP_ID = new URL(BETTER_AUTH_URL).hostname;

export const RP_NAME = "Ledger";
