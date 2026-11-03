# Ledger

Next.js 16 (App Router, Cache Components) with [Better Auth](https://better-auth.com):
email/password, passkeys, and an MCP server behind OAuth 2.1.

## Getting started

```bash
cp .env.example .env.local   # then fill in BETTER_AUTH_SECRET
npm run db:up                # local Postgres in Docker
npm run db:migrate
npm run dev
```

Development uses the database in [docker-compose.yml](docker-compose.yml);
production has its own, set in the Railway service's variables. Keep them
apart — pointing local development at production puts test accounts and
schema migrations in live data.

`npm run db:reset` destroys the local volume and re-migrates.

## Changing the database schema

Better Auth owns its tables. After adding or removing a plugin that stores data:

```bash
npm run auth:schema   # regenerate lib/db/schema.ts from the auth config
npm run db:generate   # write the SQL migration
npm run db:migrate    # apply it
```
