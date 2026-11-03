# Ledger

Next.js 16 (App Router, Cache Components) with [Better Auth](https://better-auth.com):
email/password sign-in, passkeys, and an MCP server behind OAuth 2.1.

## Getting started

```bash
cp .env.example .env.local   # then fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:migrate
npm run dev
```

Generate a secret with `openssl rand -base64 32`.

## Authentication

| Piece | Location |
| --- | --- |
| Server config | [`lib/auth.ts`](lib/auth.ts) |
| Browser client | [`lib/auth-client.ts`](lib/auth-client.ts) |
| Session reads (DAL) | [`lib/session.ts`](lib/session.ts), [`lib/passkeys.ts`](lib/passkeys.ts) |
| Auth endpoints | `app/api/auth/[...all]/route.ts` |
| MCP server | [`app/api/mcp/route.ts`](app/api/mcp/route.ts) |
| OAuth discovery at the domain root | `app/.well-known/[...path]/route.ts` |
| Pages | `/sign-in`, `/sign-up`, `/dashboard`, `/consent` |

### Reading the session

`cacheComponents` is enabled, so a session read happens at request time and
cannot be prerendered. Read it through `getCurrentUser()` and render that
component inside a `<Suspense>` boundary — reading `cookies()` outside one is a
build error. The helpers use `use cache: private`, which may read `cookies()`
and keeps the result in the browser only.

Never read the session at the top level of a layout: that holds the whole
segment, `{children}` included, behind the request.

### Passkeys

`rpID` is derived from `BETTER_AUTH_URL`, so passkeys registered against
`localhost` will not work on a deployed domain, and vice versa.

The sign-in form opts into WebAuthn conditional UI: the `webauthn` token on the
inputs' `autocomplete` is what lets the browser offer saved passkeys in its own
autofill dropdown.

### MCP

`mcp()` *is* the OAuth 2.1 provider — do not also register `oauthProvider()`.
The `jwt()` plugin is required: `requireMcpAuth` verifies access tokens against
`/api/auth/jwks`.

Discovery is served at the domain root rather than under `/api/auth`, because
the plugins match on the full URL pathname. That is what
`app/.well-known/[...path]/route.ts` is for. The chain a client follows:

1. `POST /api/mcp` with no token → `401` + `WWW-Authenticate`
2. → `/.well-known/oauth-protected-resource/api/mcp`
3. → `/.well-known/oauth-authorization-server/api/auth`
4. → `/api/auth/oauth2/authorize`, which sends the user to `/sign-in`, then `/consent`

`resource` must be byte-identical in `lib/auth.ts` and `app/api/mcp/route.ts`,
since tokens are audience-bound to that exact string. It lives in
[`lib/env.ts`](lib/env.ts) so both read the same value.

## Changing the database schema

Better Auth owns its tables. After adding or removing a plugin that stores data:

```bash
npm run auth:schema   # regenerate lib/db/schema.ts from the auth config
npm run db:generate   # write the SQL migration
npm run db:migrate    # apply it
```

### Why the config files have no `server-only` guard

`auth:schema` evaluates `lib/auth.ts` in plain Node to read your plugin list.
The `server-only` package throws outside a React Server environment, and the
CLI refuses to run when it is anywhere in that import chain — there is no flag
or export condition to opt out, because the CLI configures its own loader.

So the guard sits where it actually catches something: `lib/session.ts` and
`lib/passkeys.ts`, the modules a Client Component might realistically import by
mistake. The config chain (`lib/auth.ts`, `lib/db/index.ts`, `lib/env.ts`)
goes without, since importing `pg` from the browser already fails the build;
`lib/env.ts` adds an explicit `typeof window` check as a backstop.

Keep it that way: re-adding `import "server-only"` to any of those three
breaks `npm run auth:schema`.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:studio` | Drizzle Studio |
