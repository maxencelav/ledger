import { auth } from "@/lib/auth";

/**
 * Serves OAuth discovery metadata at the domain root.
 *
 * The MCP and OAuth provider plugins answer discovery from a request hook that
 * matches the *full* URL pathname (`/.well-known/...`), not a path relative to
 * the handler's base path. Since the Better Auth handler is mounted under
 * /api/auth, those requests would otherwise never reach the hook and 404 — and
 * the `WWW-Authenticate` challenge on /api/mcp points clients right here.
 *
 * Passing the untouched request to `auth.handler` keeps the pathname intact so
 * the hook matches.
 */
export async function GET(request: Request) {
  return auth.handler(request);
}

export async function HEAD(request: Request) {
  return auth.handler(request);
}
