/**
 * Better Auth server configuration.
 *
 * No `import "server-only"` here on purpose: the Better Auth CLI evaluates
 * this file in plain Node to derive the database schema, and that package
 * throws outside a React Server environment. The guard is not needed either,
 * since this module pulls in `pg` through lib/db and would fail to bundle for
 * the browser anyway. The guard lives on the data access layer (lib/session.ts,
 * lib/passkeys.ts), which is what a Client Component might plausibly import.
 */
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { mcp } from "@better-auth/mcp";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  BETTER_AUTH_URL,
  MCP_RESOURCE,
  RP_ID,
  RP_NAME,
} from "@/lib/env";

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    // No mail transport is wired up yet, so leave verification off rather than
    // locking new accounts out behind an email that never arrives.
    requireEmailVerification: false,
    minPasswordLength: 12,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    // Required by the MCP plugin: signs access tokens and serves /api/auth/jwks,
    // which `requireMcpAuth` verifies incoming tokens against.
    jwt(),

    passkey({
      rpID: RP_ID,
      rpName: RP_NAME,
      origin: BETTER_AUTH_URL,
    }),

    // `mcp()` IS the OAuth 2.1 provider, so no separate oauthProvider() here.
    mcp({
      loginPage: "/sign-in",
      consentPage: "/consent",
      resource: MCP_RESOURCE,
    }),

    // Client ID Metadata Documents, pinned to the profile MCP 2026-07-28
    // requires. This is what lets MCP clients register without a manual step.
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }),

    // Must stay last: it wraps the other plugins' responses so cookies set
    // during a server action are forwarded to Next's cookie store.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
